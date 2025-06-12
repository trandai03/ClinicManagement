package com.n7.service.impl;

import com.n7.dto.HistoryDTO;
import com.n7.entity.History;
import com.n7.repository.HistoryRepo;
import com.n7.utils.ConvertTimeUtils;
import com.n7.utils.JasperReportUtil;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.export.SimpleXlsReportConfiguration;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HistoryService {
    private final HistoryRepo historyRepo;
    private final BookingService bookingService;
    @Value("${TEMPLATE_PATH}")
    private String templateFolder;

    @Value("${FILE_TEMP_UPLOAD_PATH}")
    private String fileNameFullFolder;

    @Autowired
    private DataSource dataSource;

    public List<History> getAllHistory() {
        return historyRepo.findAll();
    }

    public History saveHistory(HistoryDTO historyDTO) {
        History history = History.builder().build();
        history = convertDtoToEntity(historyDTO, history);
        return historyRepo.save(history);
    }

    public History updateHistory(HistoryDTO historyDTO, Long id) {
        History history = historyRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        history = convertDtoToEntity(historyDTO, history);
        return historyRepo.save(history);
    }
    public void deleteHistory(History history) {
        historyRepo.deleteById(history.getId());
    }

    public History findById(Long id) {
        return historyRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }

    private History convertDtoToEntity(HistoryDTO historyDTO, History history){
        history.setToDate(historyDTO.getToDate());
        history.setDob(historyDTO.getDob());
        history.setFromDate(historyDTO.getFromDate());
        history.setBhyt(historyDTO.getBhyt());
        history.setAddress(historyDTO.getAddress());
        history.setName(historyDTO.getFullName());
        history.setMedicalSummary(historyDTO.getMedicalSummary());
        history.setNation(historyDTO.getNation());
        history.setBookingId(historyDTO.getBookingId());
        history.setMedicine(historyDTO.getMedicineStr());
        history.setService(historyDTO.getServiceStr());
        history.setTotalMoney(historyDTO.getTotalMoney());
        return history;
    }

    public String buildFileExportHistory(Long id) {
        Map<String, Object> paramsReport = new HashMap<>();
        History history = historyRepo.findByBookingId(id).orElseThrow(() -> new RuntimeException("Not found"));
        paramsReport.put("fullName",history.getName());
        paramsReport.put("bhyt",history.getBhyt());
//        paramsReport.put("dob",ConvertTimeUtils.convertDate(history.getDob()));
//        paramsReport.put("fromDate",ConvertTimeUtils.convertDate(history.getFromDate()));
//        paramsReport.put("toDate",ConvertTimeUtils.convertDate(history.getToDate()));
        paramsReport.put("totalMoney",history.getTotalMoney().toString());
        paramsReport.put("reason",history.getMedicalSummary());
        paramsReport.put("gender",history.getGender());
        String templateFolder = this.templateFolder;
        String fileName = "Lich_su_kham_" + Calendar.getInstance().getTimeInMillis() + ".pdf";
        String fileNameFull = this.fileNameFullFolder + File.separator + fileName;

        File templateFile = new File(templateFolder, "doan.jrxml");
        try {
            JasperReport jasperReport = JasperCompileManager.compileReport(templateFile.getAbsolutePath());
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, paramsReport, new JREmptyDataSource());
            byte[] fileInBytes = JasperExportManager.exportReportToPdf(jasperPrint);
            FileUtils.writeByteArrayToFile(new File(fileNameFull), fileInBytes);
            return fileNameFull;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
