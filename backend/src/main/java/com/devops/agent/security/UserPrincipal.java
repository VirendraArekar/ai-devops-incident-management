package com.devops.agent.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String password;
    private final String fullName;
    private final UUID organizationId;
    private final String role;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String email, String password, String fullName, UUID organizationId, String role, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.organizationId = organizationId;
        this.role = role;
        this.authorities = authorities;
    }

    public static UserPrincipal create(UUID id, String email, String password, String fullName, UUID organizationId, String role, List<String> permissions) {
        List<GrantedAuthority> authorities = new java.util.ArrayList<>();
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        }
        if (permissions != null) {
            for (String perm : permissions) {
                authorities.add(new SimpleGrantedAuthority(perm));
            }
        }
        return new UserPrincipal(id, email, password, fullName, organizationId, role, authorities);
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public String getRole() {
        return role;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
