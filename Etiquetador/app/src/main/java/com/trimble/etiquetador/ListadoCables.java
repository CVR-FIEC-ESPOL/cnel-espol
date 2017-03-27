package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.text.InputFilter;
import android.text.Spanned;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.trimble.etiquetador.adapters.CableAdapter;
import com.trimble.etiquetador.model.Cable;

import java.util.ArrayList;

public class ListadoCables extends Activity {

    DataBaseHelper myDbHelper;
    ArrayList<Cable> cables = new ArrayList<Cable>();
    CableAdapter cableadapter;
    private int posteid;
    private String codigoposte;
    private TextView viewcodigoposte;
    private EditText editcajas, editmangas, edittaps;
    private static int ncajas, nmangas, ntaps;
    private AlphaAnimation buttonClick = new AlphaAnimation(1F, 0.4F);


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_listado_cables);
        final ListView listviewCable = (ListView) findViewById(R.id.listadocables);
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        cableadapter = new CableAdapter(this,cables);
        posteid = getIntent().getIntExtra("posteid",0);
        codigoposte = getIntent().getStringExtra("codigoposte");
        listviewCable.setAdapter(cableadapter);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT * FROM cables WHERE posteid = "+posteid+";";
        Cursor c = db.rawQuery(mySql, null);
        try{
            c.moveToFirst();
            do{
                cables.add(new Cable(c.getString(c.getColumnIndex("_id")), c.getString(c.getColumnIndex("tipo")),c.getString(c.getColumnIndex("uso")),c.getInt(c.getColumnIndex("escable")),c.getInt(c.getColumnIndex("operadora")),c.getInt(c.getColumnIndex("nhilos")),c.getInt(c.getColumnIndex("npares")), c.getString(c.getColumnIndex("operadora_name"))));
                c.moveToNext();
            }while(!c.isAfterLast());
        }
        catch (android.database.CursorIndexOutOfBoundsException e){
            cables.clear();
        }
        cableadapter.notifyDataSetChanged();
        listviewCable.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(ListadoCables.this, RegistrarCable.class);
                Cable tmpcable = cables.get(position);
                intent.putExtra("posteid",posteid);
                intent.putExtra("codigoposte", codigoposte);
                intent.putExtra("barCode",tmpcable.getTagid());
                intent.putExtra("escable",tmpcable.isEscable());
                intent.putExtra("tipo",tmpcable.getTipo());
                intent.putExtra("operadora",tmpcable.getOperadora());
                intent.putExtra("nhilos",tmpcable.getNhilos());
                intent.putExtra("npares",tmpcable.getNpares());
                startActivity(intent);
                finish();
            }
        });
        mySql = "SELECT ncdd, nmangas, ntaps FROM postes WHERE _id = "+posteid+";";
        c = db.rawQuery(mySql, null);
        c.moveToFirst();
        ncajas = c.getInt(c.getColumnIndex("ncdd"));
        ntaps = c.getInt(c.getColumnIndex("ntaps"));
        nmangas = c.getInt(c.getColumnIndex("nmangas"));
        c.close();
        db.close();
        viewcodigoposte = (TextView) findViewById(R.id.viewcodigoposte);
        viewcodigoposte.setText(codigoposte);
        editcajas = (EditText) findViewById(R.id.cajasdispersion);
        editcajas.setFilters(new InputFilter[]{ new InputFilterMinMax("0", "99")});
        editcajas.setText(Integer.toString(ncajas));
        editmangas = (EditText) findViewById(R.id.mangas);
        editmangas.setFilters(new InputFilter[]{ new InputFilterMinMax("0", "99")});
        editmangas.setText(Integer.toString(nmangas));
        edittaps = (EditText) findViewById(R.id.taps);
        edittaps.setFilters(new InputFilter[]{ new InputFilterMinMax("0", "99")});
        edittaps.setText(Integer.toString(ntaps));
        editcajas.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ((EditText) v).setText("");
            }
        });
        editmangas.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ((EditText) v).setText("");
            }
        });
        edittaps.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ((EditText) v).setText("");
            }
        });
    }

    public void saveAttributes(View view){
        int ncajas_temp, nmangas_temp, ntaps_temp;
        view.startAnimation(buttonClick);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        try{
            ncajas_temp = Integer.parseInt(editcajas.getText().toString());
            nmangas_temp = Integer.parseInt(editmangas.getText().toString());
            ntaps_temp = Integer.parseInt(edittaps.getText().toString());
            if(ncajas_temp != ncajas || nmangas_temp != nmangas || ntaps_temp != ntaps){
                String mySql = "UPDATE postes SET ncdd = "+ncajas_temp+", nmangas = "+nmangas_temp+", ntaps = "+ntaps_temp+" WHERE _id = "+posteid+";";
                ncajas = ncajas_temp;
                nmangas = nmangas_temp;
                ntaps = ntaps_temp;
                db.execSQL(mySql);
                Toast toast = Toast.makeText(this,"Atributos guardados",Toast.LENGTH_SHORT);
                toast.setGravity(Gravity.TOP| Gravity.LEFT, 120, 180);
                toast.show();
            }
        }catch (NumberFormatException e){
            Toast toast = Toast.makeText(this,"No pueden haber campos sin datos",Toast.LENGTH_SHORT);
            toast.setGravity(Gravity.TOP| Gravity.LEFT, 120, 180);
            toast.show();
        }
    }

    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        cables.clear();
        cableadapter.notifyDataSetChanged();
        startActivity(new Intent(this, InfoPoste.class));
        finish();
    }

    public class InputFilterMinMax implements InputFilter {

        private int min, max;

        public InputFilterMinMax(int min, int max) {

            this.min = min;
            this.max = max;
        }

        public InputFilterMinMax(String min, String max) {
            this.min = Integer.parseInt(min);
            this.max = Integer.parseInt(max);
        }

        @Override
        public CharSequence filter(CharSequence source, int start, int end, Spanned dest, int dstart, int dend) {
            try {
                int input = Integer.parseInt(dest.toString() + source.toString());
                if (isInRange(min, max, input))
                    return null;
            } catch (NumberFormatException nfe) { }
            return "";
        }

        private boolean isInRange(int a, int b, int c) {
            return b > a ? c >= a && c <= b : c >= b && c <= a;
        }
    }
}
