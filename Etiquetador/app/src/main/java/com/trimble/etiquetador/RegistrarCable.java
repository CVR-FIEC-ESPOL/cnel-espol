package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RegistrarCable extends Activity {
    private String codigoposte;
    private int posteid;
    private String tagid;
    private String[] tipo;
    private ArrayList <String> operadora;
    private DataBaseHelper myDbHelper;
    private TextView viewAdditional;
    private TextView viewTipo;
    private TextView viewOperadora;
    private Spinner spinnertipo;
    private Spinner spinneroperadora;
    private CheckBox checkboxCable;
    private EditText numbersofitems;
    private EditText dimensions;
    private AlphaAnimation buttonClick = new AlphaAnimation(1F, 0.4F);
    //    private GpsWorker gpsWorker;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registrar_cable);
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        this.operadora = new ArrayList<String>();
        this.operadora.add("NO ENCONTRADA");
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT nombre FROM operadoras ORDER BY _id;";
        Cursor c = db.rawQuery(mySql, null);
        if(c.getCount() > 0){
            c.moveToFirst();
            String operadora_str;
            do{
                operadora_str = c.getString(c.getColumnIndex("nombre"));
                this.operadora.add(operadora_str);
                c.moveToNext();
            }while (!c.isAfterLast());
        }
        Intent intent = getIntent();
        posteid = intent.getIntExtra("posteid", 0);
        codigoposte = intent.getStringExtra("codigoposte");
        tagid = intent.getStringExtra("barCode");
        final int tipoEquipo = intent.getIntExtra("escable",0);
        TextView viewcodigoPoste = (TextView) findViewById(R.id.viewposteid);
        TextView viewtagid = (TextView) findViewById(R.id.viewtagidcable);
        viewcodigoPoste.setText(codigoposte);
        viewtagid.setText(tagid);
        viewAdditional = (TextView) findViewById(R.id.textView17);
        numbersofitems = (EditText) findViewById(R.id.numberofitems);
        viewOperadora = (TextView) findViewById(R.id.textView14);
        dimensions = (EditText) findViewById(R.id.viewdimension);
        viewTipo = (TextView) findViewById(R.id.textView15);
        this.tipo = new String[]{"FIBRA", "MULTIPAR", "RG500"};
        spinnertipo = (Spinner) findViewById(R.id.spinnerTipo);
        spinneroperadora = (Spinner) findViewById(R.id.spinnerOperadora);
        ArrayAdapter<String> adaptertipo = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, tipo);
        spinnertipo.setAdapter(adaptertipo);
        ArrayAdapter<String> adapteroperadora = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, this.operadora);
        spinneroperadora.setAdapter(adapteroperadora);
        checkboxCable = (CheckBox) findViewById(R.id.checkBoxCable);
        checkboxCable.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
             @Override
             public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                 if (checkboxCable.isChecked()) {
                     tipo = new String[]{"CAJA FUENTE", "VDT"};
                     ArrayAdapter<String> adapteroperadora = new ArrayAdapter<String>(RegistrarCable.this, android.R.layout.simple_spinner_item, tipo);
                     spinneroperadora.setAdapter(adapteroperadora);
                     viewOperadora.setText("Equipo:");
                     spinnertipo.setVisibility(View.INVISIBLE);
                     dimensions.setVisibility(View.GONE);
                     viewTipo.setVisibility(View.INVISIBLE);
                     viewAdditional.setVisibility(View.INVISIBLE);
                     numbersofitems.setVisibility(View.INVISIBLE);
                 } else {
                     ArrayAdapter<String> adapteroperadora = new ArrayAdapter<String>(RegistrarCable.this, android.R.layout.simple_spinner_item, operadora);
                     spinnertipo.setSelection(0);
                     viewTipo.setText("Tipo:");
                     spinneroperadora.setAdapter(adapteroperadora);
                     viewOperadora.setText("Operadora:");
                     spinnertipo.setVisibility(View.VISIBLE);
                     viewTipo.setVisibility(View.VISIBLE);
                     viewAdditional.setVisibility(View.VISIBLE);
                     dimensions.setVisibility(View.GONE);
                     numbersofitems.setVisibility(View.VISIBLE);
                 }
            }
            }
        );
        spinneroperadora.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parentView, View selectedItemView, int position, long id) {
                String operadora = parentView.getSelectedItem().toString();
                if (operadora.equals("CAJA FUENTE")) {
                    viewTipo.setText("Dimensiones:");
                    viewTipo.setVisibility(View.VISIBLE);
                    dimensions.setVisibility(View.VISIBLE);
                } else if(operadora.equals("VDT")) {
                    dimensions.setVisibility(View.GONE);
                    viewTipo.setVisibility(View.INVISIBLE);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parentView) {
                // your code here
            }

        });

        spinnertipo.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parentView, View selectedItemView, int position, long id) {
                String tipo = parentView.getSelectedItem().toString();
                if (tipo.equals("FIBRA")) {
                    viewAdditional.setText("# Hilos:");
                    viewAdditional.setVisibility(View.VISIBLE);
                    numbersofitems.setVisibility(View.VISIBLE);
                } else if (tipo.equals("MULTIPAR")) {
                    viewAdditional.setText("# Pares:");
                    viewAdditional.setVisibility(View.VISIBLE);
                    numbersofitems.setVisibility(View.VISIBLE);
                } else {
                    viewAdditional.setVisibility(View.INVISIBLE);
                    numbersofitems.setVisibility(View.INVISIBLE);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parentView) {
                // your code here
            }

        });
        if(tipoEquipo == 1){
            String lastoperadora = intent.getStringExtra("operadora");
            String lasttipo = intent.getStringExtra("tipo");
            int numberfeature = 0;
            if(lasttipo.equals("FIBRA")){
                numberfeature = intent.getIntExtra("nhilos",0);
                viewAdditional.setText("# Hilos:");
            }
            else if(lasttipo.equals("MULTIPAR")){
                numberfeature = intent.getIntExtra("npares",0);
                viewAdditional.setText("# Pares:");
            }
            int indexOperadora = Arrays.asList(operadora).indexOf(lastoperadora);
            int indexTipo = Arrays.asList(tipo).indexOf(lasttipo);
            spinneroperadora.setSelection(indexOperadora);
            spinnertipo.setSelection(indexTipo);
            numbersofitems.setText(Integer.toString(numberfeature));
        }
        else if(tipoEquipo == 2){
            checkboxCable.setChecked(true);
            spinnertipo.setSelection(2);
        }
    }


    public void modificarCable(View view){
        view.startAnimation(buttonClick);
        String tipoCable = spinnertipo.getSelectedItem().toString();
        String operadoraCable = spinneroperadora.getSelectedItem().toString();
        CheckBox checkboxCable = (CheckBox) findViewById(R.id.checkBoxCable);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "";
        if(checkboxCable.isChecked()){
            if(operadoraCable.equals("CAJA FUENTE")){
                mySql = "UPDATE cables SET uso ='DISTRIBUCION',operadora= 0,npares=0,nhilos=0,escable ="+2+",dimension='"+dimensions.getText().toString()+"',tipo ='"+operadoraCable+"' WHERE _id = '"+tagid+"';";
            }
            else{
                mySql = "UPDATE cables SET uso ='DISTRIBUCION',operadora= 0,npares=0,nhilos=0,escable ="+2+",dimension='',tipo ='"+operadoraCable+"' WHERE _id = '"+tagid+"';";
            }
        }
        else{
            int operadora_id;
            if(operadoraCable.equals("NO ENCONTRADA")){
                operadora_id = 0;
            }
            else{
                mySql = "SELECT _id FROM operadoras WHERE nombre = '"+operadoraCable+"';";
                Cursor c = db.rawQuery(mySql, null);
                c.moveToFirst();
                operadora_id = c.getInt(c.getColumnIndex("_id"));
                c.close();
            }
            if(tipoCable.equals("FIBRA")){
                mySql = "UPDATE cables SET tipo ='"+tipoCable+"',escable ="+1+",operadora = "+operadora_id+" ,operadora_name = '"+operadoraCable+"' , uso='DISTRIBUCION', dimension='', nhilos = '"+numbersofitems.getText().toString()+"', npares = 0 WHERE _id = '"+tagid+"';";
            }
            else if(tipoCable.equals("MULTIPAR")){
                mySql = "UPDATE cables SET tipo ='"+tipoCable+"',escable ="+1+",operadora = "+operadora_id+" ,operadora_name = '"+operadoraCable+"' , uso='DISTRIBUCION', dimension='', npares = '"+numbersofitems.getText().toString()+"', nhilos = 0 WHERE _id = '"+tagid+"';";
            }
            else{
                mySql = "UPDATE cables SET tipo ='"+tipoCable+"',escable ="+1+",operadora = "+operadora_id+" ,operadora_name = '"+operadoraCable+"' , uso='DISTRIBUCION', dimension='', npares = 0, nhilos = 0 WHERE _id = '"+tagid+"';";
            }
        }
        db.execSQL(mySql);
        db.close();
        Intent intent = new Intent(this, ListadoCables.class);
        intent.putExtra("posteid",posteid);
        intent.putExtra("codigoposte",codigoposte);
        startActivity(intent);
        finish();
    }

    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        Intent intent = new Intent(this, ListadoCables.class);
        intent.putExtra("posteid",posteid);
        intent.putExtra("codigoposte",codigoposte);
        startActivity(intent);
        finish();
    }
}
