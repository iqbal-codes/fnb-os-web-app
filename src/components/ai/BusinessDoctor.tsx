"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  DollarSign,
  Package,
  BarChart3,
  Target,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAIBusinessAnalysis,
  useRefreshAIAnalysis,
  type BusinessAnalysis,
  type BusinessIssue,
  type Recommendation,
} from "@/hooks/useAI";
import { toast } from "sonner";

interface HealthMetric {
  name: string;
  score: number;
  status: "good" | "warning" | "critical";
  description: string;
  icon: typeof DollarSign;
}

const statusColors = {
  good: "text-green-600 bg-green-100",
  warning: "text-yellow-600 bg-yellow-100",
  critical: "text-red-600 bg-red-100",
};

const severityColors = {
  low: "border-blue-200 bg-blue-50",
  medium: "border-yellow-200 bg-yellow-50",
  high: "border-red-200 bg-red-50",
};

const severityIcons = {
  low: Lightbulb,
  medium: AlertTriangle,
  high: AlertTriangle,
};

const categoryIcons = {
  pricing: Target,
  cogs: BarChart3,
  opex: DollarSign,
  inventory: Package,
  sales: TrendingUp,
};

export function BusinessDoctor() {
  const { data: analysis, isLoading, error } = useAIBusinessAnalysis();
  const refreshMutation = useRefreshAIAnalysis();
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (analysis) {
      setLastAnalysis(new Date().toLocaleString("id-ID"));
    }
  }, [analysis]);

  const handleAnalyze = async () => {
    try {
      await refreshMutation.mutateAsync();
      setLastAnalysis(new Date().toLocaleString("id-ID"));
      toast.success("Analisis selesai!");
    } catch {
      toast.error("Gagal menganalisis bisnis");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Attention";
  };

  const overallScore = analysis?.health_score || 0;

  // Generate metrics from analysis
  const healthMetrics: HealthMetric[] = analysis?.issues
    ? [
        {
          name: "Revenue Health",
          score: analysis.issues.some((i) => i.type === "sales") ? 60 : 80,
          status: analysis.issues.some(
            (i) => i.type === "sales" && i.severity === "high"
          )
            ? "critical"
            : analysis.issues.some((i) => i.type === "sales")
            ? "warning"
            : "good",
          description: "Performa penjualan",
          icon: DollarSign,
        },
        {
          name: "Cost Efficiency",
          score: analysis.issues.some((i) => i.type === "cogs") ? 55 : 75,
          status: analysis.issues.some(
            (i) => i.type === "cogs" && i.severity === "high"
          )
            ? "critical"
            : analysis.issues.some((i) => i.type === "cogs")
            ? "warning"
            : "good",
          description: "Efisiensi biaya",
          icon: BarChart3,
        },
        {
          name: "Inventory Health",
          score: analysis.issues.some((i) => i.type === "inventory") ? 65 : 85,
          status: analysis.issues.some(
            (i) => i.type === "inventory" && i.severity === "high"
          )
            ? "critical"
            : analysis.issues.some((i) => i.type === "inventory")
            ? "warning"
            : "good",
          description: "Kesehatan stok",
          icon: Package,
        },
        {
          name: "Pricing Health",
          score: analysis.issues.some((i) => i.type === "pricing") ? 50 : 80,
          status: analysis.issues.some(
            (i) => i.type === "pricing" && i.severity === "high"
          )
            ? "critical"
            : analysis.issues.some((i) => i.type === "pricing")
            ? "warning"
            : "good",
          description: "Margin & pricing",
          icon: Target,
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">AI Business Doctor</CardTitle>
                <CardDescription className="text-xs">
                  {lastAnalysis
                    ? `Terakhir: ${lastAnalysis}`
                    : "Belum pernah dianalisis"}
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAnalyze}
              disabled={refreshMutation.isPending}
            >
              {refreshMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              {refreshMutation.isPending ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p
                    className={`text-5xl font-bold ${getScoreColor(
                      overallScore
                    )}`}
                  >
                    {overallScore}
                  </p>
                  <p className="text-sm text-muted-foreground">Health Score</p>
                </div>
                <div className="flex-1 space-y-2">
                  <Progress value={overallScore} className="h-3" />
                  <div className="flex items-center gap-1">
                    {overallScore >= 70 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : overallScore >= 50 ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      {getScoreLabel(overallScore)}
                    </span>
                  </div>
                </div>
              </div>
              {analysis.summary && (
                <p className="text-sm text-muted-foreground mt-3 border-t pt-3">
                  {analysis.summary}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">
                Klik Analyze untuk mendapatkan insights dari AI
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={refreshMutation.isPending}
              >
                <Brain className="h-4 w-4 mr-2" />
                Mulai Analisis AI
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Metrics Grid */}
      {healthMetrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.name}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        statusColors[metric.status]
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {metric.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {metric.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={metric.score} className="h-1.5 flex-1" />
                    <span
                      className={`text-sm font-bold ${getScoreColor(
                        metric.score
                      )}`}
                    >
                      {metric.score}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Issues */}
      {analysis?.issues && analysis.issues.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Masalah Terdeteksi ({analysis.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.issues.map((issue, idx) => {
              const Icon = severityIcons[issue.severity];
              const CategoryIcon = categoryIcons[issue.type] || AlertTriangle;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    severityColors[issue.severity]
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon
                      className={`h-5 w-5 mt-0.5 shrink-0 ${
                        issue.severity === "high"
                          ? "text-red-600"
                          : issue.severity === "medium"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{issue.title}</p>
                        <Badge variant="outline" className="text-xs">
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {issue.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Rekomendasi AI
            </CardTitle>
            <CardDescription>
              Saran untuk meningkatkan performa bisnis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {rec.priority}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{rec.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      {rec.impact}
                    </p>
                    <Badge variant="outline" className="text-xs mt-2">
                      {rec.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Review COGS
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Update Harga
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Package className="h-4 w-4 mr-2" />
              Cek Stok
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Target className="h-4 w-4 mr-2" />
              Set Target
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

