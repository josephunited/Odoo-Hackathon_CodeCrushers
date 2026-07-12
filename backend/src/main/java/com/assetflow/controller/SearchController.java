package com.assetflow.controller;

import com.assetflow.assets.model.Asset;
import com.assetflow.assets.repository.AssetRepository;
import com.assetflow.entity.Employee;
import com.assetflow.repository.EmployeeRepository;
import com.assetflow.entity.Department;
import com.assetflow.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> search(@RequestParam String q) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.ok(results);
        }

        String query = q.toLowerCase();

        // Assets
        List<Asset> assets = assetRepository.findAll();
        for (Asset a : assets) {
            if (a.getName().toLowerCase().contains(query) || a.getAssetTag().toLowerCase().contains(query)) {
                Map<String, Object> map = new HashMap<>();
                map.put("type", "asset");
                map.put("id", a.getId());
                map.put("title", a.getName());
                map.put("subtitle", a.getAssetTag());
                results.add(map);
            }
        }

        // Employees
        List<Employee> employees = employeeRepository.findAll();
        for (Employee e : employees) {
            if (e.getName().toLowerCase().contains(query) || e.getEmail().toLowerCase().contains(query)) {
                Map<String, Object> map = new HashMap<>();
                map.put("type", "employee");
                map.put("id", e.getId());
                map.put("title", e.getName());
                map.put("subtitle", e.getDesignation() != null ? e.getDesignation() : "Employee");
                results.add(map);
            }
        }

        // Departments
        List<Department> depts = departmentRepository.findAll();
        for (Department d : depts) {
            if (d.getName().toLowerCase().contains(query)) {
                Map<String, Object> map = new HashMap<>();
                map.put("type", "department");
                map.put("id", d.getId());
                map.put("title", d.getName());
                map.put("subtitle", "Department");
                results.add(map);
            }
        }

        return ResponseEntity.ok(results);
    }
}
