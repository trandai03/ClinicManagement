package com.n7.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleModel {
    private long id;
    private String title;
    private String content;
    private String image;
    private String date;
}
