package com.chinesecodex.dto;

import java.math.BigDecimal;
import java.util.List;

public record HomeOverviewResponse(
    UserSummary user,
    FinanceSummary finance,
    List<QuickEntry> quickEntries,
    List<TaskItem> tasks,
    List<RedDotLog> redDotLogs
) {

    public record UserSummary(
        String nickname,
        String memberLevel,
        long tokenBalance,
        int anxietyValue,
        String nextBenefit
    ) {
    }

    public record FinanceSummary(
        BigDecimal todayVirtualProfit,
        String imaginedAnnualRate,
        String withdrawStatus,
        String riskNotice
    ) {
    }

    public record QuickEntry(
        String key,
        String title,
        String subtitle,
        String badgeText,
        String bugText
    ) {
    }

    public record TaskItem(
        String title,
        String progressText,
        String rewardText
    ) {
    }

    public record RedDotLog(
        String targetName,
        String message
    ) {
    }
}
