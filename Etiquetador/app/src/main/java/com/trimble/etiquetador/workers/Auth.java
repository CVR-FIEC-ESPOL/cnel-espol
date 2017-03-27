package com.trimble.etiquetador.workers;

import android.util.Base64;

import java.net.HttpURLConnection;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class Auth{
    private Mac mac;
    private byte[] base64;

    public Auth(String key)
            throws Exception {
        mac = Mac.getInstance("HmacSHA256");
//            base64 = new Base64();
        base64 = Base64.decode(key,Base64.NO_WRAP);
        mac.init(new SecretKeySpec(base64, "HmacSHA256"));
    }

    private static String nvl(String attr, String val) {
        return attr != null ? attr : val;
    }

    static String buildCanonicalizedString(
            String method,        String cm_date,        String encoding,
            String language,      String length,         String md5,
            String content_type,  String if_mod_since,   String if_match,
            String if_none_match, String if_unmod_since, String range) {

        return method              + "\n"
                + nvl(encoding, "")       + "\n"             /*Content-Encoding*/
                + nvl(language, "")       + "\n"             /*Content-Language*/
                + nvl(length, "")         + "\n"             /*Content-Length*/
                + nvl(md5, "")            + "\n"             /*Content-MD5*/
                + nvl(content_type, "")   + "\n"             /*Content-Type*/
                + nvl(cm_date, "")        + "\n"             /*Date*/
                + nvl(if_mod_since, "")   + "\n"             /*If-Modified-Since*/
                + nvl(if_match, "")       + "\n"             /*If-Match*/
                + nvl(if_none_match, "")  + "\n"             /*If-None-Match*/
                + nvl(if_unmod_since, "") + "\n"             /*If-Unmodified-Since*/
                + nvl(range, "")          + "\n";            /*Range*/
    }

    static String buildCanonicalizedString(String method,
                                           String cm_date) {
        return buildCanonicalizedString(method, cm_date,
                null, null, null, null, null,
                null, null, null, null, null);
    }

    String buildSignature(String method, String cm_date)
            throws Exception {
        String inputValue = buildCanonicalizedString(method, cm_date);
        String sig = new String(Base64.encode( mac.doFinal(
                inputValue.toString().getBytes("UTF-8")), Base64.NO_WRAP));
        return sig;
    }

    public String signRequest(HttpURLConnection request, String user)
            throws Exception {
        String cm_date = get_Date();
        String sig = buildSignature(request.getRequestMethod(), cm_date);
        String auth = "SharedKey " + user + ":" + sig;
        return auth;
    }

    public String get_Date(){
        SimpleDateFormat fmt = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss");
        fmt.setTimeZone(TimeZone.getTimeZone("GMT"));
        String cm_date = fmt.format(Calendar.getInstance().getTime()) + " GMT";
        return cm_date;
    }
}