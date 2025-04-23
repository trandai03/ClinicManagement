package com.n7.service.impl;

import com.n7.dto.ArticleDTO;
import com.n7.dto.MajorDTO;
import com.n7.entity.Article;
import com.n7.entity.Major;
import com.n7.exception.ResourceAlreadyExitsException;
import com.n7.model.ArticleModel;
import com.n7.model.MajorModel;
import com.n7.repository.ArticleRepo;
import com.n7.repository.MajorRepo;
import com.n7.service.IArticleService;
import com.n7.utils.ConvertTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService implements IArticleService {
    private final ArticleRepo articleRepo;
    public List<ArticleModel> getAll(){
        return articleRepo.findAll().stream().map(this::convertEntityToModel).collect(Collectors.toList());
    }
    public Optional<Article> findById(long id) {
        return articleRepo.findById(id);
    }
    public boolean checkTitleArticle(String title) {
        return articleRepo.findByTitle(title)!=null;
    }

    @Transactional
    public boolean saveArticle(ArticleDTO articleDTO, Long id, String image, String idImage) {
        Article article = new Article();
        if(id!=null) article.setId(id);
        convertDTOtoEntity(articleDTO,article);
        if(idImage != null && image != null) {
            article.setUrl_id(idImage);
            article.setImage(image);
        }
        Article article1 = articleRepo.save(article);
        return article1 != null;
    }

    @Transactional
    public void updateArticle(ArticleDTO articleDTO, Long id, String image, String idImage) {
        Article article = articleRepo.findById(id).get();
        if(!article.getTitle().equals(articleDTO.getTitle()) && checkTitleArticle(articleDTO.getTitle())) {
            throw new ResourceAlreadyExitsException("Tên tiêu đề đã trùng với 1 tin khác");
        }
        article.setTitle(articleDTO.getTitle());
        article.setContent(articleDTO.getContent());
        if(image != null && idImage != null) {
            article.setUrl_id(idImage);
            article.setImage(image);
        }
        articleRepo.save(article);
    }

    @Transactional
    public void deleteArticle(Long id) {
        articleRepo.deleteById(id);
    }

    public void convertDTOtoEntity(ArticleDTO articleDTO, Article article) {
        article.setTitle(articleDTO.getTitle());
        article.setContent(articleDTO.getContent());
    }

    public ArticleModel convertEntityToModel(Article article) {
        ArticleModel model = new ArticleModel();
        model.setId(article.getId());
        model.setTitle(article.getTitle());
        model.setContent(article.getContent());
        model.setImage(article.getImage());
        model.setDate(article.getCreate_at().toString());
        return model;
    }
}
