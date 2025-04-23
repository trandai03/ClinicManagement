package com.n7.entity;

import com.n7.constant.RoleName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true)
    private RoleName name;

    @Column(length = 100)
    private String description;

    @OneToMany(fetch = FetchType.EAGER,mappedBy = "role")
    private List<User> users = new ArrayList<>();

    public Role(RoleName roleName, String description) {
        this.name = roleName;
        this.description = description;
    }
}
