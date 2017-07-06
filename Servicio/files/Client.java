import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

//import java.nio.file.Path;
//import java.nio.file.FileSystems;

import java.io.File;
import java.io.FileInputStream;
import org.apache.commons.io.IOUtils;

import java.net.*;
import java.util.*;
import java.text.*;
import javax.crypto.*;
import javax.crypto.spec.*;
import org.apache.commons.codec.binary.Base64;

class Auth
{
    private static String nvl(String attr, String val) {
        return attr != null ? attr : "";
    }

    public static String buildCanonicalizedString(
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

    public static String buildCanonicalizedString(String method,
                                                  String cm_date) {
        return buildCanonicalizedString(method, cm_date,
                                        null, null, null, null, null,
                                        null, null, null, null, null);
    }

    private Mac mac;
    private static Base64 base64;

    public Auth(String key)
            throws Exception {
        mac = Mac.getInstance("HmacSHA256");
        base64 = new Base64();
        mac.init(new SecretKeySpec(base64.decode(key), "HmacSHA256"));
    }

    public String buildSignature(String method, String cm_date)
            throws Exception {
        String inputValue = buildCanonicalizedString(method, cm_date);
        String sig = new String(base64.encode( mac.doFinal(
                inputValue.toString().getBytes("UTF-8")) ));
        System.out.println("sig en client es: \"" + sig + "\"");
        return sig;
    }

    public void signRequest(HttpURLConnection request, String user)
            throws Exception {
        SimpleDateFormat fmt = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss");
        fmt.setTimeZone(TimeZone.getTimeZone("GMT"));
        String cm_date = fmt.format(Calendar.getInstance().getTime()) + " GMT";

        String sig = buildSignature(request.getRequestMethod(), cm_date);
        String auth = "SharedKey " + user + ":" + sig;
        request.setRequestProperty("Authorization", auth);
        request.setRequestProperty("Date", cm_date);
    }
}

public class Client
{
    public static void main(String[] args)
            throws Exception {
        URL url = new URL("http://127.0.0.1:8020/poste/extras/foto");
        HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
        httpCon.setRequestProperty("Content-Disposition", "attachment; filename =\"martin.jpg\"");
        httpCon.setRequestProperty("Transfer-Encoding", "chunked");
        httpCon.setRequestProperty("Content-Type", "image/jpeg");
        httpCon.setDoOutput(true);
        httpCon.setRequestMethod("POST");

        // Adding signature to request
        Auth auth = new Auth("elpassword");
        auth.signRequest(httpCon, "user1");

        File f = new File("mathias.jpg");
        java.io.OutputStream out = httpCon.getOutputStream();
        IOUtils.copy(new FileInputStream(f), out);

        System.out.println(httpCon.getResponseCode());
        System.out.println(httpCon.getResponseMessage());
        out.close();
    }
}

