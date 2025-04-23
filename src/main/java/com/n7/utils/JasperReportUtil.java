package com.n7.utils;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;

public class JasperReportUtil {
    private static final Logger LOG = LoggerFactory.getLogger(JasperReportUtil.class);
    private JRXlsxExporter xlsxExporter = new JRXlsxExporter();

    public JasperReportUtil() {
    }


    public void exportToXlsx(final JasperPrint jasperPrint, final String fileName, final String sheetName) {
        try {
            FileUtils.writeByteArrayToFile(new File(fileName), this.exportToXlsx(jasperPrint, sheetName));
        } catch (IOException var5) {
            LOG.error("Exception occurred while exporting report to xlsx: {}", var5.getMessage());
        }
    }

    public byte[] exportToXlsx(final JasperPrint jasperPrint, final String sheetName) {
        SimpleXlsxReportConfiguration reportConfig = new SimpleXlsxReportConfiguration();
        reportConfig.setSheetNames(new String[]{sheetName});
        return this.exportToXlsx(jasperPrint, reportConfig);
    }

    public byte[] exportToXlsx(final JasperPrint jasperPrint, final SimpleXlsxReportConfiguration reportConfiguration) {
        if (this.xlsxExporter == null) {
            this.xlsxExporter = new JRXlsxExporter();
        }

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            this.xlsxExporter.setExporterInput(new SimpleExporterInput(jasperPrint));
            this.xlsxExporter.setExporterOutput(new SimpleOutputStreamExporterOutput(out));
            this.xlsxExporter.setConfiguration(reportConfiguration);
            this.xlsxExporter.exportReport();
            this.xlsxExporter.reset();
            return out.toByteArray();
        } catch (JRException var4) {
            LOG.error("Exception occurred while exporting report to xlsx: {}", var4.getMessage());
            throw new RuntimeException("Can not export report to xlsx", var4);
        }
    }
}