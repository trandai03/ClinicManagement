package com.n7.service;

import com.n7.dto.ArticleDTO;
import com.n7.entity.Article;
import com.n7.model.ArticleModel;

import java.util.List;
import java.util.Optional;

public interface IArticleService {
     List<ArticleModel> getAll();
     boolean saveArticle(ArticleDTO articleDTO, Long id, String image, String idImage);
     Optional<Article> findById(long id);
     void deleteArticle(Long id);
     ArticleModel convertEntityToModel(Article article);
     void convertDTOtoEntity(ArticleDTO articleDTO, Article article);
}
