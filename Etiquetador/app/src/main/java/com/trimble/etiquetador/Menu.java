package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.widget.Toast;

import java.io.IOException;


public class Menu extends Activity {
    private DataBaseHelper myDbHelper;
    private AlphaAnimation buttonClick = new AlphaAnimation(1F, 0.4F);
    private static final String MyPREFERENCES = "LoginCNEL" ;
    private String estado;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        estado = getIntent().getStringExtra("Transfer");
        if(estado != null){
            String estado_msg;
            if(estado.equals("OK")){
                estado_msg = "Transferencia con éxito";
            }
            else if(estado.equals("TIMEOUT")){
                estado_msg = "Problemas de conexión con el servidor";
            }
            else if(estado.equals("ERROR")){
                estado_msg = "Se ha producido un error, intente de nuevo";
            }
            else if(estado.equals("EMPTY")){
                estado_msg = "No existen datos para transferir";
            }
            else{
                System.out.println(estado);
                estado_msg = estado;
            }
            Toast toast = Toast.makeText(Menu.this,estado_msg,Toast.LENGTH_SHORT);
            toast.setGravity(Gravity.TOP, 0, 450);
            toast.show();
        }
    }


    public void iniciarMedicion(View view){
        view.startAnimation(buttonClick);
        Intent intent = new Intent(this, ListadoPostes.class);
        startActivity(intent);
        finish();
    }

    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        SharedPreferences sharedpreferences = getSharedPreferences(MyPREFERENCES, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedpreferences.edit();
        editor.clear();
        editor.apply();
        myDbHelper.close();
        startActivity(new Intent(this, Login.class));
        finish();
    }

    public void postesPendientes(View view){
        view.startAnimation(buttonClick);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT * FROM postes WHERE estado = 1;";
        Cursor c = db.rawQuery(mySql, null);
        if(c.getCount() == 0) {
            Toast toast = Toast.makeText(this, "No existen postes pendientes", Toast.LENGTH_SHORT);
            toast.setGravity(Gravity.TOP | Gravity.LEFT, 65, 230);
            toast.show();
        }
        else{
            Intent intent = new Intent(this, PostesPendientes.class);
            myDbHelper.close();
            startActivity(intent);
            finish();
        }
    }

    public void postesFinalizados(View view){
        view.startAnimation(buttonClick);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT * FROM postes WHERE estado = 2;";
        Cursor c = db.rawQuery(mySql, null);
        if(c.getCount() == 0) {
            Toast toast = Toast.makeText(this, "No existen postes finalizados", Toast.LENGTH_SHORT);
            toast.setGravity(Gravity.TOP | Gravity.LEFT, 65, 230);
            toast.show();
            db.close();
            c.close();
        }
        else{
            Intent intent = new Intent(this, listaFinalizados.class);
            db.close();
            c.close();
            myDbHelper.close();
            startActivity(intent);
            finish();
        }
    }

    public void transferirDatos(View view) throws IOException {
        view.startAnimation(buttonClick);
        Intent intent = new Intent(this, Transferir.class);
        startActivity(intent);
        finish();
    }

    public void sincronizarDatos(View view) {
        view.startAnimation(buttonClick);
        Intent intent = new Intent(this, Transferir.class);
        startActivity(intent);
        finish();
    }

}
