package com.chinesecodex.dto;

public record LoginResponse(String userId, String tokenName, String tokenValue, long timeoutSeconds) {
}
