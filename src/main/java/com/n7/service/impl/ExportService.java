package com.n7.service.impl;

import com.n7.repository.BookingRepo;
import com.n7.utils.JasperReportUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.export.SimpleXlsReportConfiguration;
import org.apache.commons.io.FileUtils;
import org.jxls.common.Context;
import org.jxls.util.JxlsHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.*;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class ExportService {

    @Autowired
    private BookingService bookingService;

    @Value("${TEMPLATE_PATH}")
    private String templateFolder;

    @Value("${FILE_TEMP_UPLOAD_PATH}")
    private String fileNameFullFolder;

    @Autowired
    private DataSource dataSource;

    public String buildFileExportUser(List<?> objects, String nameDb) {
        Map<String, Object> paramsReport = new HashMap<>();
        paramsReport.put("sl", objects.size());
        paramsReport.put("p_sql", "select * from " + nameDb);
        String templateFolder = this.templateFolder;
        String fileName = "Template_export" + Calendar.getInstance().getTimeInMillis() + ".xlsx";
        String fileNameFull = this.fileNameFullFolder + File.separator + fileName;

        File templateFile = new File(templateFolder, "jasperrach.jrxml");
        try {
            JasperReport jasperReport = JasperCompileManager.compileReport(templateFile.getAbsolutePath());
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, paramsReport, dataSource.getConnection());
            SimpleXlsReportConfiguration configuration = new SimpleXlsReportConfiguration();
            configuration.setOnePagePerSheet(true);
            configuration.setDetectCellType(true); // Detect cell types (date and etc.)
            configuration.setWhitePageBackground(false); // No white background!
            configuration.setFontSizeFixEnabled(false);

            // No spaces between rows and columns
            configuration.setRemoveEmptySpaceBetweenRows(true);
            configuration.setRemoveEmptySpaceBetweenColumns(true);

            JasperReportUtil instance = new JasperReportUtil();
            byte[] fileInBytes = instance.exportToXlsx(jasperPrint, "Test vui thoi");
            FileUtils.writeByteArrayToFile(new File(fileNameFull), fileInBytes);

            return fileNameFull;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
