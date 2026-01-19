package com.springai.semanticbooksearchlive.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BookWebController {

    @GetMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}
