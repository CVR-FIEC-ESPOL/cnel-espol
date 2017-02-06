package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.trimble.etiquetador.adapters.PosteAdapter;
import com.trimble.etiquetador.model.Poste;

import java.util.ArrayList;

public class ListadoRepetidos extends Activity {
    protected DataBaseHelper myDbHelper;
    protected ArrayList<Poste> postes = new ArrayList<Poste>();
    protected PosteAdapter posteadapter;
    protected InputMethodManager inputManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_listado_repetidos);
        postes = (ArrayList<Poste>) getIntent().getSerializableExtra("postes");
        final ListView listviewPoste = (ListView) findViewById(R.id.listarepetidos);
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
                Intent intent = new Intent(ListadoRepetidos.this, InfoPoste.class);
                Poste tmpposte = postes.get(position);
                intent.putExtra("IdPoste", tmpposte.getId());
                intent.putExtra("CodigoPoste",tmpposte.getCodigo());
                intent.putExtra("Sector",tmpposte.getSector());
                intent.putExtra("NCables",tmpposte.getNcables());
                postes.clear();
                posteadapter.notifyDataSetChanged();
                SQLiteDatabase db = myDbHelper.getReadableDatabase();
                String mySql = "UPDATE postes SET estado = 1 WHERE _id = "+tmpposte.getId()+";";
                db.execSQL(mySql);
                db.close();
                startActivity(intent);
            }
        });
        listviewPoste.setAdapter(posteadapter);
        inputManager = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);

    }

    public void regresarRegistrarPoste(View view){
        Intent intent = new Intent(this, RegistrarPoste.class);
        startActivity(intent);
    }
}
