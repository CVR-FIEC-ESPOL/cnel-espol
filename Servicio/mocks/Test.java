import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
 
//import java.nio.file.Path;
//import java.nio.file.FileSystems;

import java.io.File;
import java.io.FileInputStream;
import org.apache.commons.io.IOUtils;

public class Test {
 public static void main(String[] args) throws IOException {
  URL url = new URL("http://127.0.0.1:8081/poste/extras/foto");
  HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
  httpCon.setRequestProperty("Content-Disposition", "attachment; filename =\"martin.jpg\"");
  httpCon.setRequestProperty("Transfer-Encoding", "chunked");
  httpCon.setRequestProperty("Content-Type", "image/jpeg");
  httpCon.setDoOutput(true);
  httpCon.setRequestMethod("POST");

  File f = new File("mathias.jpg");
  java.io.OutputStream out = httpCon.getOutputStream();
  IOUtils.copy(new FileInputStream(f), out);
/*
  Path path = FileSystems.getDefault().getPath(".", "mathias.jpg");
System.out.println("fn: " + path.getFileName());
  java.io.OutputStream out = httpCon.getOutputStream();
  java.nio.file.Files.copy(path, out);
 */

/*
  OutputStreamWriter out = new OutputStreamWriter(
      httpCon.getOutputStream());
 */
  System.out.println(httpCon.getResponseCode());
  System.out.println(httpCon.getResponseMessage());
  out.close();
 }
}
