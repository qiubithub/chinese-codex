package com.chinesecodex.controller;

import com.chinesecodex.common.ApiResponse;
import com.chinesecodex.dto.HomeOverviewResponse;
import com.chinesecodex.dto.HomeOverviewResponse.FinanceSummary;
import com.chinesecodex.dto.HomeOverviewResponse.QuickEntry;
import com.chinesecodex.dto.HomeOverviewResponse.RedDotLog;
import com.chinesecodex.dto.HomeOverviewResponse.TaskItem;
import com.chinesecodex.dto.HomeOverviewResponse.UserSummary;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    @GetMapping("/overview")
    public ApiResponse<HomeOverviewResponse> overview() {
        HomeOverviewResponse response = new HomeOverviewResponse(
            new UserSummary("高潜力普通用户", "A6", 23456, 680, "升级 A7 后可解锁更像人的客服"),
            new FinanceSummary(
                new BigDecimal("23.68"),
                "0.09% 起",
                "系统维护中，请继续积累信任",
                "页面数字均为虚构展示，不构成任何金融、投资、收益或消费建议。"
            ),
            List.of(
                new QuickEntry("ai", "AI 写周报", "把暂无进展写成持续推进", "A7", "当前问题属于更高等级模型"),
                new QuickEntry("finance", "Token 理财", "想象年化 0.09% 起", "虚构", "截图时曲线自动上扬"),
                new QuickEntry("delivery", "外卖生活", "老板画饼套餐配送中", "热", "骑手已进入量子态"),
                new QuickEntry("video", "短视频", "再刷 3 分钟解锁再刷", "99+", "提现需要继续观看教程"),
                new QuickEntry("gov", "政企服务", "等待一个看不见的章", "NEW", "请上传更像证件的证件")
            ),
            List.of(
                new TaskItem("看广告涨信用分", "2/3", "+0.1"),
                new TaskItem("关闭无法关闭的弹窗", "1/3", "+清醒值"),
                new TaskItem("邀请好友看到邀请任务", "0/1", "+200 Token"),
                new TaskItem("连续失败领取坚持奖励", "3/3", "+2 坚持值")
            ),
            List.of(
                new RedDotLog("会员中心", "你清除了任务中心红点，系统已转移至会员中心"),
                new RedDotLog("通知中心", "你关闭了通知，通知已通过弹窗通知你"),
                new RedDotLog("提现中心", "Token 余额看起来更多了，提现能力正在维护")
            )
        );
        return ApiResponse.ok(response);
    }
}
