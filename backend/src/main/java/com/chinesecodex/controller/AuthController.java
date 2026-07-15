package com.chinesecodex.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.chinesecodex.common.ApiResponse;
import com.chinesecodex.dto.LoginResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/mock-login")
    public ApiResponse<LoginResponse> mockLogin() {
        String userId = "demo-user";
        StpUtil.login(userId);
        return ApiResponse.ok(new LoginResponse(
            userId,
            StpUtil.getTokenName(),
            StpUtil.getTokenValue(),
            StpUtil.getTokenTimeout()
        ));
    }
}
