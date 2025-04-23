package com.n7.dto;

import com.n7.constant.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO {
    @NotNull(message = "Title can not null")
    @Size(min = 10,max = 255,message = "Length of title must between 10 and 255")
    private String title;
    @NotNull(message = "Content can not empty")
    @Size(min = 10,max = 255,message = "Length of content must between 10 and 255")
    private String content;
}
