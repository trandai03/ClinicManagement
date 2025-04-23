//package com.n7.service.impl;
//
//import com.n7.service.IRedisService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.redis.core.HashOperations;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Map;
//import java.util.Set;
//import java.util.concurrent.TimeUnit;
//
//@Service
//@RequiredArgsConstructor
//public class RedisService implements IRedisService {
//
//    private final RedisTemplate<String,Object> redisTemplate;
////    private final HashOperations<String,String,Object> hashOperations;
//
//    @Override
//    public void set(String key, String value) {
//        redisTemplate.opsForValue().set(key, value);
//    }
//
//    @Override
//    public Object get(String key) {
//        return redisTemplate.opsForValue().get(key);
//    }
//
//    public Set<String> getAllKey() {
//        return redisTemplate.keys("*");
//    }
//
//    @Override
//    public void setTimeToLive(String key, long time) {
//        redisTemplate.expire(key,time, TimeUnit.MINUTES);
//    }
//
//    @Override
//    public boolean exists(String key) {
//        return redisTemplate.opsForValue().get(key) != null;
//    }
//
//    @Override
//    public Map<String, Object> getField(String key) {
//        return Map.of();
//    }
//
//    @Override
//    public void delete(String key) {
//
//    }
//
//    @Override
//    public void delete(String key, String field) {
//
//    }
//
//    @Override
//    public void delete(String key, List<String> fields) {
//
//    }
//}
