package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import com.trimble.etiquetador.adapters.PosteAdapter;
import com.trimble.etiquetador.model.Poste;

import java.util.ArrayList;

public class listaFinalizados extends Activity {

    protected DataBaseHelper myDbHelper;
    protected ArrayList<Poste> postes = new ArrayList<Poste>();
    protected PosteAdapter posteadapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lista_finalizados);
        final ListView listviewPoste = (ListView) findViewById(R.id.listafinalizados);
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        posteadapter = new PosteAdapter(this,postes);
        listviewPoste.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(listaFinalizados.this, InfoPoste.class);
                Poste tmpposte = postes.get(position);
                intent.putExtra("IdPoste", tmpposte.getId());
                intent.putExtra("CodigoPoste",tmpposte.getCodigo());
                intent.putExtra("Sector",tmpposte.getSector());
                intent.putExtra("NCables",tmpposte.getNcables());
                intent.putExtra("Ventana","finalizados");
                intent.putExtra("uuid",tmpposte.getUuid());
                postes.clear();
                posteadapter.notifyDataSetChanged();
                startActivity(intent);
                finish();
            }
        });
        listviewPoste.setAdapter(posteadapter);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT * FROM postes WHERE estado = 2;";
        Cursor c = db.rawQuery(mySql, null);
        c.moveToFirst();
        posteadapter.notifyDataSetChanged();
        do{
            postes.add(new Poste(c.getString(c.getColumnIndex("codigoposte")), c.getString(c.getColumnIndex("alimentador")),c.getInt(c.getColumnIndex("_id")),c.getInt(c.getColumnIndex("ncables")), c.getString(c.getColumnIndex("uuid"))));
            c.moveToNext();
        }while(!c.isAfterLast());

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
