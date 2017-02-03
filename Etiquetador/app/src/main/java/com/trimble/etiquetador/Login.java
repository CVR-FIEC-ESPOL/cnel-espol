package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Intent;
import android.database.SQLException;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import java.io.IOException;

public class Login extends Activity {
	public DataBaseHelper myDbHelper;
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_login);
		myDbHelper = new DataBaseHelper(this);
		try {
			myDbHelper.createDataBase();
		} catch (IOException ioe) {
            Log.w("Database",ioe.getMessage());
		}
		try {
			myDbHelper.openDataBase();
		}catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
	}

	public void verifyUser(View view) {
		String user = ((TextView) findViewById(R.id.user)).getText().toString();
		String password = ((TextView) findViewById(R.id.password)).getText().toString();
		if(user.equals("cnel") && password.equals("123")){
			Intent intent = new Intent(this, Menu.class);
			startActivity(intent);
		}
	}
}
