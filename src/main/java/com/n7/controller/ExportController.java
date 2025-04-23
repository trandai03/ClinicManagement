package com.n7.controller;

import com.n7.service.impl.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ExportController {
    private final ExportService exportService;

}
