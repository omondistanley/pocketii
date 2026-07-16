import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GATEWAY_BASE_URL } from "../../src/config";
import { authClient } from "../../src/authClient";
import { formatApiDetail } from "../../src/formatApiDetail";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import {
  FINANCIAL_GUIDANCE_DISCLOSURE,
  FinancialGuidanceNotice,
} from "../../src/components/FinancialGuidanceNotice";
import { useAppTheme, type AppTheme } from "../../src/theme";

type RiskProfile = {
  risk_tolerance?: string;
  industry_preferences?: string[];
  loss_aversion?: string;
  use_finance_data_for_recommendations?: boolean;
};

type Recommendation = {
  symbol?: string;
  full_name?: string;
  sector?: string;
  score?: number | string;
  confidence?: number | string;
  why_shown_one_line?: string;
  bull_case?: string;
  bear_case?: string;
};

type LatestResponse = {
  run?: { run_id?: string; id?: string; created_at?: string };
  items?: Recommendation[];
  portfolio?: Record<string, unknown>;
  pagination?: { total_items?: number };
};

type ExplainResponse = {
  explanation?: {
    analyst_note?: string;
    why_selected?: string[];
    risk_notes?: string[];
    data_freshness?: Record<string, unknown>;
  };
};

const RISK = ["conservative", "balanced", "aggressive"] as const;
const LOSS = ["low", "moderate", "high"] as const;

function numberOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function GuidanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<LatestResponse | null>(null);
  const [risk, setRisk] = useState("balanced");
  const [loss, setLoss] = useState("moderate");
  const [industries, setIndustries] = useState("");
  const [useFinance, setUseFinance] = useState(false);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [explain, setExplain] = useState<ExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  const runId = String(latest?.run?.run_id ?? latest?.run?.id ?? "");

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const response = await authClient.requestWithRefresh(`${GATEWAY_BASE_URL}${path}`, init);
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(formatApiDetail((json as any)?.detail, `Request failed (${response.status})`));
    }
    return json;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profile, recs] = await Promise.all([
        request("/api/v1/risk-profile"),
        request("/api/v1/recommendations/latest?page=1&page_size=20&enrich=1"),
      ]);
      const p = (profile ?? {}) as RiskProfile;
      setRisk(String(p.risk_tolerance ?? "balanced"));
      setLoss(String(p.loss_aversion ?? "moderate"));
      setIndustries(Array.isArray(p.industry_preferences) ? p.industry_preferences.join(", ") : "");
      setUseFinance(Boolean(p.use_finance_data_for_recommendations));
      setLatest((recs ?? {}) as LatestResponse);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load guidance.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void load();
  }, [load]);

  const savePreferences = async () => {
    setSaving(true);
    setError(null);
    try {
      await request("/api/v1/risk-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          risk_tolerance: risk,
          loss_aversion: loss,
          industry_preferences: industries.split(",").map((x) => x.trim()).filter(Boolean),
          use_finance_data_for_recommendations: useFinance,
        }),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const runAnalysis = async () => {
    setRunning(true);
    setError(null);
    try {
      await savePreferences();
      await request("/api/v1/recommendations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not run analysis.");
    } finally {
      setRunning(false);
    }
  };

  const openDetails = async (item: Recommendation) => {
    setSelected(item);
    setExplain(null);
    if (!runId || !item.symbol) return;
    setExplainLoading(true);
    try {
      const result = await request(
        `/api/v1/recommendations/${encodeURIComponent(runId)}/explain/${encodeURIComponent(item.symbol)}`,
      );
      setExplain((result ?? {}) as ExplainResponse);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load explanation.");
    } finally {
      setExplainLoading(false);
    }
  };

  const items = latest?.items ?? [];
  const portfolioValue = numberOrNull(latest?.portfolio?.total_value);

  return (
    <>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.onSurface} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Guidance</Text>
            <Text style={styles.subtitle}>Ranked informational analysis based on your preferences.</Text>
          </View>
        </View>

        <FinancialGuidanceNotice />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <Text style={styles.cardSub}>These inputs shape ranking and explanation, not instructions to trade.</Text>
          <Text style={styles.label}>Risk tolerance</Text>
          <View style={styles.chips}>
            {RISK.map((value) => (
              <Pressable key={value} onPress={() => setRisk(value)} style={[styles.chip, risk === value && styles.chipActive]}>
                <Text style={[styles.chipText, risk === value && styles.chipTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Loss aversion</Text>
          <View style={styles.chips}>
            {LOSS.map((value) => (
              <Pressable key={value} onPress={() => setLoss(value)} style={[styles.chip, loss === value && styles.chipActive]}>
                <Text style={[styles.chipText, loss === value && styles.chipTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Industries or sectors</Text>
          <Input value={industries} onChangeText={setIndustries} placeholder="technology, healthcare, broad market" />
          <Pressable style={styles.financeToggle} onPress={() => setUseFinance((v) => !v)}>
            <MaterialCommunityIcons
              name={useFinance ? "checkbox-marked" : "checkbox-blank-outline"}
              size={22}
              color={theme.colors.primary}
            />
            <Text style={styles.financeCopy}>Use budgets, goals, income, and expenses to personalize context</Text>
          </Pressable>
          <View style={styles.actions}>
            <Button title="Save preferences" onPress={savePreferences} loading={saving} disabled={saving || running} tone="secondary" />
            <Button title="Run analysis" onPress={runAnalysis} loading={running} disabled={saving || running} />
          </View>
        </View>

        {portfolioValue !== null ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Portfolio context</Text>
            <Text style={styles.metric}>${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
            <Text style={styles.cardSub}>Value included in the latest analytical snapshot.</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} /> : null}

        {!loading && !items.length ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No guidance yet</Text>
            <Text style={styles.cardSub}>Save preferences and run analysis to generate an informational ranked list.</Text>
          </View>
        ) : null}

        {items.map((item, index) => {
          const confidenceRaw = numberOrNull(item.confidence);
          const confidence = confidenceRaw === null ? null : confidenceRaw <= 1 ? confidenceRaw * 100 : confidenceRaw;
          return (
            <View style={styles.card} key={`${item.symbol ?? "item"}-${index}`}>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.symbol}>{item.symbol ?? "—"}</Text>
                  <Text style={styles.cardSub}>{item.full_name ?? item.sector ?? "Portfolio candidate"}</Text>
                </View>
                <View style={styles.scorePill}>
                  <Text style={styles.scoreText}>Score {String(item.score ?? "—")}</Text>
                </View>
              </View>
              {confidence !== null ? <Text style={styles.meta}>{Math.round(confidence)}% analytical confidence</Text> : null}
              {item.why_shown_one_line ? <Text style={styles.body}>{item.why_shown_one_line}</Text> : null}
              <FinancialGuidanceNotice compact />
              <Button title="View evidence and risks" onPress={() => openDetails(item)} tone="secondary" />
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={selected !== null} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.resultHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{selected?.symbol ?? "Details"}</Text>
                <Text style={styles.cardSub}>Evidence, limitations, and risk context</Text>
              </View>
              <Pressable style={styles.iconButton} onPress={() => setSelected(null)}>
                <MaterialCommunityIcons name="close" size={20} color={theme.colors.onSurface} />
              </Pressable>
            </View>
            <FinancialGuidanceNotice />
            <ScrollView style={{ marginTop: 12 }}>
              {explainLoading ? <ActivityIndicator color={theme.colors.primary} /> : null}
              {selected?.bull_case ? <><Text style={styles.label}>Potential upside context</Text><Text style={styles.body}>{selected.bull_case}</Text></> : null}
              {selected?.bear_case ? <><Text style={styles.label}>Risk context</Text><Text style={styles.body}>{selected.bear_case}</Text></> : null}
              {explain?.explanation?.analyst_note ? <><Text style={styles.label}>Analytical note</Text><Text style={styles.body}>{explain.explanation.analyst_note}</Text></> : null}
              {(explain?.explanation?.why_selected ?? []).map((line, i) => <Text style={styles.bullet} key={`why-${i}`}>• {line}</Text>)}
              {(explain?.explanation?.risk_notes ?? []).map((line, i) => <Text style={styles.bullet} key={`risk-${i}`}>• {line}</Text>)}
              <Text style={styles.disclosureText}>{FINANCIAL_GUIDANCE_DISCLOSURE}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { paddingHorizontal: 16, gap: 14 },
    header: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 2 },
    iconButton: { width: 38, height: 38, borderRadius: 9, borderWidth: 1, borderColor: theme.colors.outlineVariant, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
    title: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: theme.colors.onSurface },
    subtitle: { fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 2 },
    card: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.outlineVariant, borderRadius: 14, padding: 15, gap: 11 },
    cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: theme.colors.onSurface },
    cardSub: { fontSize: 11, lineHeight: 16, color: theme.colors.onSurfaceVariant },
    label: { fontSize: 11, fontFamily: "Inter_700Bold", color: theme.colors.onSurface, marginTop: 4 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
    chip: { borderWidth: 1, borderColor: theme.colors.outlineVariant, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11 },
    chipActive: { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary },
    chipText: { textTransform: "capitalize", fontSize: 11, color: theme.colors.onSurfaceVariant, fontFamily: "Inter_600SemiBold" },
    chipTextActive: { color: theme.colors.onPrimaryContainer },
    financeToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
    financeCopy: { flex: 1, fontSize: 11, lineHeight: 16, color: theme.colors.onSurfaceVariant },
    actions: { gap: 8 },
    metric: { fontSize: 28, fontFamily: "Inter_800ExtraBold", color: theme.colors.onSurface },
    error: { color: theme.colors.error, fontSize: 12 },
    resultHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    symbol: { fontSize: 18, fontFamily: "Inter_800ExtraBold", color: theme.colors.onSurface },
    scorePill: { backgroundColor: theme.colors.primaryContainer, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9 },
    scoreText: { fontSize: 10, fontFamily: "Inter_700Bold", color: theme.colors.onPrimaryContainer },
    meta: { fontSize: 10, color: theme.colors.primary, fontFamily: "Inter_600SemiBold" },
    body: { fontSize: 12, lineHeight: 18, color: theme.colors.onSurface },
    bullet: { fontSize: 12, lineHeight: 19, color: theme.colors.onSurfaceVariant, marginBottom: 4 },
    disclosureText: { fontSize: 11, lineHeight: 16, fontFamily: "Inter_700Bold", color: theme.colors.onTertiaryContainer, marginTop: 14 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(9,20,38,0.56)", justifyContent: "flex-end" },
    modalCard: { maxHeight: "86%", backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18 },
  });
}
