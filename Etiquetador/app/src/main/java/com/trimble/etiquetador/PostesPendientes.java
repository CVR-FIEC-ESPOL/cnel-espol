package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.Toast;

import com.trimble.etiquetador.adapters.PosteAdapter;
import com.trimble.etiquetador.model.Poste;

import java.util.ArrayList;

public class PostesPendientes extends Activity {
    private static ArrayList<Poste> postes = new ArrayList<Poste>();
    private static PosteAdapter posteadapter;
    private DataBaseHelper myDbHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_postes_pendientes);
        final ListView listviewPoste = (ListView) findViewById(R.id.postesPendientes);
        myDbHelper = new DataBaseHelper(PostesPendientes.this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        posteadapter = new PosteAdapter(this,postes);
        listviewPoste.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(PostesPendientes.this, InfoPoste.class);
                Poste tmpposte = postes.get(position);
                intent.putExtra("IdPoste", tmpposte.getId());
                intent.putExtra("CodigoPoste",tmpposte.getCodigo());
                intent.putExtra("Sector",tmpposte.getSector());
                intent.putExtra("NCables",tmpposte.getNcables());
                intent.putExtra("Ventana","pendientes");
                intent.putExtra("uuid",tmpposte.getUuid());
                postes.clear();
                posteadapter.notifyDataSetChanged();
                startActivity(intent);
                finish();
            }
        });
        listviewPoste.setAdapter(posteadapter);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT * FROM postes WHERE estado = 1;";
        Cursor c = db.rawQuery(mySql, null);
        c.moveToFirst();
        posteadapter.notifyDataSetChanged();
        do{
            postes.add(new Poste(c.getString(c.getColumnIndex("codigoposte")), c.getString(c.getColumnIndex("alimentador")),c.getInt(c.getColumnIndex("_id")),c.getInt(c.getColumnIndex("ncables")), c.getString(c.getColumnIndex("uuid"))));
            c.moveToNext();
        }while(!c.isAfterLast());
        c.close();
        db.close();

    }
    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        postes.clear();
        posteadapter.notifyDataSetChanged();
        startActivity(new Intent(this, Menu.class));
        finish();
    }

}
