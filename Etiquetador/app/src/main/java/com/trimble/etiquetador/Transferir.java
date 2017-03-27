package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.widget.TextView;

import com.google.gson.Gson;
import com.trimble.etiquetador.workers.Auth;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;


public class Transferir extends Activity {
    private PostTask posttask;
    private DataBaseHelper myDbHelper;
    private static final String MyPREFERENCES = "LoginCNEL" ;
    private TextView posteactual, notransferidos;
    private int noTransferCount = 0, transferCount = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_transferir);
        GifImageView gifImageView = (GifImageView) findViewById(R.id.GifImageView);
        gifImageView.setGifImageResource(R.drawable.sending);
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        posteactual = (TextView) findViewById(R.id.viewtransfer);
        notransferidos = (TextView) findViewById(R.id.viewnotransfer);
        posttask = new PostTask();
        posttask.execute();

    }

    class PostTask extends AsyncTask<Void, String, Boolean> {
        String server_ip = "http://192.168.1.112:8020";

        @Override
        protected void onProgressUpdate(String... progress) {
            posteactual.setText(progress[1]);
            notransferidos.setText(progress[0]);
        }

        @Override
        protected Boolean doInBackground(Void... params) {
            SharedPreferences sharedpreferences = getSharedPreferences(MyPREFERENCES, Context.MODE_PRIVATE);
            String estado = "OK";
            String user = sharedpreferences.getString("user","");
            String password = sharedpreferences.getString("password","");
            SQLiteDatabase db = myDbHelper.getReadableDatabase();
            String mySql = "SELECT * FROM postes WHERE estado = 2;";
            Cursor c = db.rawQuery(mySql, null);
            if(c.getCount() > 0) {
                transferCount = c.getCount();
                publishProgress(Integer.toString(transferCount),Integer.toString(noTransferCount));
                c.moveToFirst();
                int ssid, httpResponse = 0, objectid,  ncables, nmangas, ntaps, ncdd, flag;
                String uuid,  globalid, alimentador, codigoposte, usuario;
                int flag_cable;
                double x, y;
                do{
                    try {
                        flag_cable = 0;
                        System.out.println("initializing POST");
                        uuid = c.getString(c.getColumnIndex("uuid"));
                        ssid = c.getInt(c.getColumnIndex("_id"));
                        objectid = c.getInt(c.getColumnIndex("objectid"));
                        globalid = c.getString(c.getColumnIndex("globalid"));
                        alimentador = c.getString(c.getColumnIndex("alimentador"));
                        codigoposte = c.getString(c.getColumnIndex("codigoposte"));
                        usuario = c.getString(c.getColumnIndex("usuario"));
                        ncables = c.getInt(c.getColumnIndex("ncables"));
                        nmangas = c.getInt(c.getColumnIndex("nmangas"));
                        ntaps = c.getInt(c.getColumnIndex("ntaps"));
                        ncdd = c.getInt(c.getColumnIndex("ncdd"));
                        x = c.getDouble(c.getColumnIndex("x"));
                        y = c.getDouble(c.getColumnIndex("y"));
                        URL url = new URL(server_ip+"/poste/extras/foto");
                        File photo = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM),"/Etiquetador/pos_"+uuid+".jpeg");
                        if(!photo.exists()){
                            System.out.println("Foto de poste no existe");
                            c.moveToNext();
                            continue;
                        }
                        do{
                            try{
                                flag = 0;
                                httpResponse = sendPhoto(url, photo, user, password);
                            }catch (java.net.SocketException e){
                                System.out.println(e.getMessage());
                                flag = 1;
                            }
                        }while (flag == 1);
                        if(httpResponse != 200){
                            estado = "ERROR";
                            break;
                        }
                        System.out.println(httpResponse);
                        System.out.println("Poste enviado");
                        photo = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM),"/Etiquetador/cab_"+uuid+".jpeg");
                        if(!photo.exists()){
                            System.out.println("Foto de cables no existe");
                            c.moveToNext();
                            continue;
                        }
                        do{
                            try{
                                flag = 0;
                                httpResponse = sendPhoto(url, photo, user, password);
                            }catch (java.net.SocketException e){
                                System.out.println(e.getMessage());
                                flag = 1;
                            }
                        }while (flag == 1);
                        if(httpResponse != 200){
                            estado = "ERROR";
                            break;
                        }
                        System.out.println(httpResponse);
                        System.out.println("Cables enviado");
                        mySql = "SELECT * FROM cables WHERE posteid = "+ssid+";";
                        Cursor c2 = db.rawQuery(mySql, null);
                        if(c2.getCount() > 0){
                            List<String> cables = new ArrayList<String>();
                            c2.moveToFirst();
                            String tagid, tipo, uso, dimension, rfid;
                            int escable, nhilos, npares, operadora;
                            do{
                                escable = c2.getInt(c2.getColumnIndex("escable"));
                                if(escable == 1 || escable == 2){
                                    JSONObject json = new JSONObject();
                                    rfid = c2.getString(c2.getColumnIndex("rfid"));
                                    tagid = c2.getString(c2.getColumnIndex("_id"));
                                    tipo = c2.getString(c2.getColumnIndex("tipo"));
                                    uso = c2.getString(c2.getColumnIndex("uso"));
                                    operadora = c2.getInt(c2.getColumnIndex("operadora"));
                                    nhilos = c2.getInt(c2.getColumnIndex("nhilos"));
                                    npares = c2.getInt(c2.getColumnIndex("npares"));
                                    dimension = c2.getString(c2.getColumnIndex("dimension"));
                                    json.put("rfid",rfid);
                                    json.put("tag_id",tagid);
                                    json.put("tipo",tipo);
                                    json.put("uso",uso);
                                    json.put("es_cable",escable);
                                    json.put("operadora",operadora);
                                    json.put("n_hilos",nhilos);
                                    json.put("n_pares",npares);
                                    json.put("dimension",dimension);
                                    cables.add(json.toString());
                                    c2.moveToNext();
                                }
                                else{
                                    flag_cable = 1;
                                    break;
                                }
                            }while(!c2.isAfterLast());
                            c2.close();
                            if(flag_cable == 0){
                                JSONObject json = new JSONObject();
                                try {
                                    System.out.println("Convirtiendo");
                                    String cablesJSON = new Gson().toJson(cables);
                                    URL urljson = new URL(server_ip+"/poste/extras");
                                    json.put("uuid",uuid);
                                    json.put("object_id",objectid);
                                    json.put("global_id",globalid);
                                    json.put("alimentador",alimentador);
                                    json.put("codigo_poste",codigoposte);
                                    json.put("usuario", usuario);
                                    json.put("ncables",ncables);
                                    json.put("nmangas",nmangas);
                                    json.put("ntaps",ntaps);
                                    json.put("ncdd",ncdd);
                                    json.put("x",x);
                                    json.put("y",y);
                                    json.put("cables",cablesJSON);
                                    System.out.println(json.toString());
                                    System.out.println("Json Done");
                                    httpResponse = sendJSON(urljson, json, user, password);
                                    if(httpResponse != 200){
                                        noTransferCount += 1;
                                    }
                                    transferCount -= 1;
                                    publishProgress(Integer.toString(transferCount),Integer.toString(noTransferCount));
                                } catch(Exception e) {
                                    Log.w("Error",e.getMessage());
                                }
                            }
                            else{
                                noTransferCount += 1;
                                transferCount -= 1;
                                publishProgress(Integer.toString(transferCount),Integer.toString(noTransferCount));
                            }
                        }
                        else{
                            c.moveToNext();
                            continue;
                        }
                    } catch (java.net.SocketTimeoutException e){
                        estado = "TIMEOUT";
                        System.out.println(e.getMessage());
                        db.close();
                        myDbHelper.close();
                        Intent intent = new Intent(Transferir.this, Menu.class);
                        intent.putExtra("Transfer",estado);
                        startActivity(intent);
                        finish();
                        return true;
                    } catch (Exception e){
                        estado = "ERROR";
                        e.printStackTrace();
                        db.close();
                        myDbHelper.close();
                        Intent intent = new Intent(Transferir.this, Menu.class);
                        intent.putExtra("Transfer",estado);
                        startActivity(intent);
                        finish();
                        return true;
                    }
                    mySql = "DELETE FROM cables WHERE posteid = "+ssid+";";
                    db.execSQL(mySql);
                    mySql = "DELETE FROM postes WHERE _id = "+ssid+";";
                    db.execSQL(mySql);
                    c.moveToNext();
                }while(!c.isAfterLast());
                c.close();
            }
            else{
                estado = "EMPTY";
            }
            db.close();
            myDbHelper.close();
            Intent intent = new Intent(Transferir.this, Menu.class);
            intent.putExtra("Transfer",estado);
            startActivity(intent);
            finish();
            return true;
        }


        private int sendPhoto(URL url, File photo, String user, String password) throws Exception {
            int httpResponse;
            String auth_str;
            HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
            httpCon.setRequestProperty("Content-Disposition","attachment; filename=\""+photo.getName()+"\"");
            httpCon.setRequestProperty("Transfer-Encoding","chunked");
            httpCon.setRequestProperty("Content-Type","image/jpeg");
            httpCon.setDoOutput(true);
            httpCon.setRequestMethod("POST");
            Auth auth = new Auth(password);
            auth_str = auth.signRequest(httpCon, user);
            httpCon.setRequestProperty("Authorization", auth_str);
            httpCon.setRequestProperty("Date", auth.get_Date());
            httpCon.setConnectTimeout(3000);
            httpCon.connect();
            OutputStream out =  httpCon.getOutputStream();
            FileInputStream fn = new FileInputStream(photo);
            IOUtils.copy(fn,out);
            fn.close();
            out.close();
            httpResponse = httpCon.getResponseCode();
            httpCon.disconnect();
            return httpResponse;
        }

        private int sendJSON(URL url, JSONObject json, String user, String password) throws Exception {
            int httpResponse;
            String auth_str;
            HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
            httpCon.setRequestProperty("Content-Type","application/json; charset=UTF-8");
            httpCon.setRequestMethod("POST");
            Auth auth = new Auth(password);
            auth_str = auth.signRequest(httpCon, user);
            httpCon.setRequestProperty("Authorization", auth_str);
            httpCon.setRequestProperty("Date", auth.get_Date());
            httpCon.setConnectTimeout(3000);
            httpCon.setDoOutput(true);
            httpCon.setDoInput(true);
            httpCon.connect();
            OutputStream out =  httpCon.getOutputStream();
            out.write(json.toString().getBytes("UTF-8"));
            out.close();
            httpResponse = httpCon.getResponseCode();
            httpCon.disconnect();
            return httpResponse;
        }

    }

}
