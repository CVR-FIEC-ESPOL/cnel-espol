package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;

public class Login extends Activity {
	private DataBaseHelper myDbHelper;
	private AlphaAnimation buttonClick = new AlphaAnimation(1F, 0.4F);
    private static final String MyPREFERENCES = "LoginCNEL" ;
    private String user, password;
    private PostTask posttask;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_login);
		myDbHelper = new DataBaseHelper(this);
		try {
			myDbHelper.createDataBase();
		} catch (IOException ioe) {
            Log.w("Database",ioe.getMessage());
		} catch (Exception e){
			Log.w("Database",e.getMessage());
		}
	}

    @Override
    public boolean onCreateOptionsMenu(android.view.Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu, menu);
        return super.onCreateOptionsMenu(menu);
    }

    public void verifyUser(View view) {
		view.startAnimation(buttonClick);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        user = ((TextView) findViewById(R.id.user)).getText().toString();
        password = ((TextView) findViewById(R.id.password)).getText().toString();
        if(!user.isEmpty() && !password.isEmpty()){
            String q = "SELECT * FROM account WHERE username = '"+user+"' and password = '"+password+"';";
            Cursor c = db.rawQuery(q, null);
            if(c.getCount() == 0){
                c.close();
                db.close();
                myDbHelper.close();
                Toast toast = Toast.makeText(this,"Usuario y/o contraseña incorrecta",Toast.LENGTH_SHORT);
                toast.setGravity(Gravity.TOP| Gravity.LEFT, 35, 440);
                toast.show();
            }
            else{
                c.close();
                db.close();
                myDbHelper.close();
                SharedPreferences sharedpreferences = getSharedPreferences(MyPREFERENCES, Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = sharedpreferences.edit();
                editor.putString("user", user);
                editor.putString("password",password);
                editor.apply();
                Intent intent = new Intent(Login.this, Menu.class);
                startActivity(intent);
                finish();
            }
        }
        else{
            Toast toast = Toast.makeText(this,"Usuario y contraseña no pueden quedar en blanco",Toast.LENGTH_SHORT);
            toast.setGravity(Gravity.TOP| Gravity.LEFT, 35, 440);
            toast.show();
        }
    }

	@Override
	public void onBackPressed()
	{
		finish();
	}

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.refresh_users:
                posttask = new PostTask();
                posttask.execute();
                return true;
            default:
                return true;
        }
    }

    class PostTask extends AsyncTask<Void, String, Boolean> {
        String server_ip = "http://192.168.1.112:8020";
        int httpResponse;

        @Override
        protected Boolean doInBackground(Void... params) {
            try {
                BufferedReader br;
                StringBuilder sb;
                String output, q;
                SQLiteDatabase db;
                URL url = new URL(server_ip+"/users");
                HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
                httpCon.setRequestMethod("GET");
                httpCon.setConnectTimeout(3000);
                httpCon.connect();
                br = new BufferedReader(new InputStreamReader((httpCon.getInputStream())));
                sb = new StringBuilder();
                while ((output = br.readLine()) != null)
                    sb.append(output);
                JSONObject json = new JSONObject(sb.toString());
                httpResponse = httpCon.getResponseCode();
                httpCon.disconnect();
                JSONArray jsonarr = json.getJSONArray("users");
                if(httpResponse == 200 && jsonarr != null){
                    db = myDbHelper.getReadableDatabase();
                    q = "DELETE FROM account; DELETE FROM sqlite_sequence WHERE name='account';";
                    db.execSQL(q);
                    for (int i = 0; i < jsonarr.length(); i++) {
                        JSONObject objects = jsonarr.getJSONObject(i);
                        Iterator key = objects.keys();
                        ArrayList<String> accounts = new ArrayList<String>();
                        while (key.hasNext()) {
                            String k = key.next().toString();
                            accounts.add(objects.getString(k));
                        }
                        q = "INSERT INTO account (username,password) VALUES ('"+accounts.get(0)+"','"+accounts.get(1)+"')";
                        db.execSQL(q);
                    }
                    db.close();
                    return true;
                }
            } catch (MalformedURLException e) {
                Log.e("Error",e.getMessage());
            } catch (IOException e) {
                Log.e("Error",e.getMessage());
            } catch (JSONException e) {
                Log.e("Error",e.getMessage());
            }
            return false;
        }

        @Override
        protected void onPostExecute(Boolean result) {
            if(result){
                Toast toast = Toast.makeText(Login.this, "La base de datos de usuarios ha sido actualizada", Toast.LENGTH_SHORT);
                toast.setGravity(Gravity.TOP | Gravity.LEFT, 65, 410);
                toast.show();
            }
            else{
                Toast toast = Toast.makeText(Login.this, "No se pudo actualizar la base de datos debido a problemas con el servidor", Toast.LENGTH_SHORT);
                toast.setGravity(Gravity.TOP | Gravity.LEFT, 65, 410);
                toast.show();
            }
        }


    }

}
