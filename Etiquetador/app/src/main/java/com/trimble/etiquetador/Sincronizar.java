package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;

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

public class Sincronizar extends Activity {
    private PostTask posttask;
    private DataBaseHelper myDbHelper;
    private static final String MyPREFERENCES = "LoginCNEL" ;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sincronizar);
    }

    class PostTask extends AsyncTask<Void, String, Boolean> {

        @Override
        protected void onProgressUpdate(String... progress) {
`
        }

        @Override
        protected Boolean doInBackground(Void... params) {
            SharedPreferences sharedpreferences = getSharedPreferences(MyPREFERENCES, Context.MODE_PRIVATE);
            String estado = "OK";
            String user = sharedpreferences.getString("user", "");
            String password = sharedpreferences.getString("password", "");
            SQLiteDatabase db = myDbHelper.getReadableDatabase();
            String mySql = "SELECT * FROM postes WHERE estado = 2;";
            Cursor c = db.rawQuery(mySql, null);
            String server_ip = "http://192.168.1.112:8020";
            return true;
        }

    }
}
