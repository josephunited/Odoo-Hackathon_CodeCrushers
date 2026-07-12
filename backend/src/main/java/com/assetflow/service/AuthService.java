package com.assetflow.service;

import com.assetflow.dto.LoginRequest;
import com.assetflow.dto.LoginResponse;
import com.assetflow.dto.RegisterRequest;

public interface AuthService {
    LoginResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
}
