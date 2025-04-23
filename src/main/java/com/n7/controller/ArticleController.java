package com.n7.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.n7.dto.ArticleDTO;
import com.n7.dto.MajorDTO;
import com.n7.entity.Article;
import com.n7.entity.Major;
import com.n7.exception.ResourceAlreadyExitsException;
import com.n7.model.ArticleModel;
import com.n7.model.MajorModel;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import com.n7.service.impl.ArticleService;
import com.n7.service.impl.CloudinaryService;
import com.n7.service.impl.MajorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/")
@RequiredArgsConstructor
public class ArticleController {
    private final CloudinaryService cloudinaryService;
    private final ArticleService articleService;
    @PostMapping(value = "article")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createArticle(@RequestPart("file") MultipartFile multipartFile,
                                         @RequestPart("articleDto") String object) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            byte[] bytesGiaiMa = Base64.getDecoder().decode(object);
            String giaiMaBase64 = new String(bytesGiaiMa);
            ArticleDTO articleDTO = objectMapper.readValue(giaiMaBase64,ArticleDTO.class);
            if(articleService.checkTitleArticle(articleDTO.getTitle())){
                return ResponseEntity.badRequest().body(new ErrorResponse<>("Tên tiêu đề đã tồn tại"));
            }
            Map data = cloudinaryService.upload(multipartFile);
            articleService.saveArticle(articleDTO,null,data.get("url").toString(),data.get("public_id").toString());
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã tạo thành công"));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }

    @PutMapping(value = "article/{id}")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateArticle(@RequestPart(value = "file",required = false) MultipartFile multipartFile,
                                         @RequestPart(value = "articleDto") String object,
                                         @PathVariable("id") Long id) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            byte[] bytesGiaiMa = Base64.getDecoder().decode(object);
            String giaiMaBase64 = new String(bytesGiaiMa);
            ArticleDTO articleDTO = objectMapper.readValue(giaiMaBase64,ArticleDTO.class);
            String image = null, idImage = null;
            Article article = articleService.findById(id).get();
            if(article==null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse<>("Tin tức không tồn tại!!!"));
            }
            if(multipartFile!=null){
                Map data = cloudinaryService.upload(multipartFile);
                cloudinaryService.delete(article.getUrl_id());
                image = data.get("url").toString();
                idImage = data.get("public_id").toString();
                articleService.updateArticle(articleDTO,id,image,idImage);
            }
            else {
                articleService.updateArticle(articleDTO,id,null,null);
            }
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã cập nhật thành công"));
        }
        catch (ResourceAlreadyExitsException ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse<>(ex.getMessage()));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping(value = "articles")
    public ResponseEntity<?> getAllArticle() {
        try{
            List<ArticleModel> list = articleService.getAll();
            return ResponseEntity.ok(new SuccessResponse<>("Get success",list));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }

    @DeleteMapping(value = "article/{id}")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteArticle(@PathVariable("id") Long id) {
        try{
            Optional<Article> article = articleService.findById(id);
            if(article.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse<>("Id tin tức không tồn tại!!!"));
            }
            articleService.deleteArticle(id);
            cloudinaryService.delete(article.get().getUrl_id());
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã xóa thành công tin tức có id: " + id));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }
}
