package com.n7.repository;

import com.n7.entity.Article;
import com.n7.entity.Major;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepo extends JpaRepository<Article , Long> {
    Article findByTitle(String name);
}
