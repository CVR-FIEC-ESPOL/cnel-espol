package com.trimble.etiquetador;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
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
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;
import com.trimble.etiquetador.adapters.CableAdapter;
import com.trimble.etiquetador.model.Cable;

import java.util.ArrayList;

public class InfoPoste extends Activity implements View.OnClickListener {
    private Button boton;
    protected DataBaseHelper myDbHelper;
    private static int posteid;
    private static String codigoposte;
    private static String sector;
    private static int ncables;
    protected InputMethodManager inputManager;
    protected ArrayList<Cable> cables = new ArrayList<Cable>();
    protected CableAdapter cableadapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_info_poste);
        final ListView listviewCables = (ListView) findViewById(R.id.listacables);
        boton = (Button) findViewById(R.id.boton);
        boton.setOnClickListener(this);
        Intent intent = getIntent();
        if(intent.getIntExtra("IdPoste",0) != 0){
            posteid = intent.getIntExtra("IdPoste",0);
            codigoposte = intent.getStringExtra("CodigoPoste");
            sector = intent.getStringExtra("Sector");
        }
        ncables = intent.getIntExtra("NCables",0);
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        cableadapter = new CableAdapter(this,cables);
        TextView viewcodigoPoste = (TextView) findViewById(R.id.viewcodigo);
        TextView viewsector = (TextView) findViewById(R.id.viewsector);
        EditText viewncable = (EditText) findViewById(R.id.viewncable);
        viewcodigoPoste.setText(codigoposte);
        viewsector.setText(sector);
        viewncable.setText(Integer.toString(ncables));
        viewncable.setFilters(new InputFilter[]{ new InputFilterMinMax("0", "99")});
        listviewCables.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position,long id) {
                Intent intent = new Intent(InfoPoste.this, RegistrarCable.class);
                Cable tmpcable = cables.get(position);
                intent.putExtra("modificar",1);
                intent.putExtra("barCode",tmpcable.getTagid());
                intent.putExtra("posteId",posteid);
                intent.putExtra("sector",sector);
                intent.putExtra("codigoPoste",codigoposte);
                startActivity(intent);
            }
        });
        listviewCables.setAdapter(cableadapter);
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT * FROM cables WHERE posteid = '"+posteid+"';";
        Cursor c = db.rawQuery(mySql, null);
        try{
            c.moveToFirst();
            cableadapter.notifyDataSetChanged();
            do{
                cables.add(new Cable(c.getString(c.getColumnIndex("_id")), c.getString(c.getColumnIndex("tipo")),c.getString(c.getColumnIndex("uso")),c.getInt(c.getColumnIndex("escable"))!= 0,c.getString(c.getColumnIndex("operadora"))));
                c.moveToNext();
            }while(!c.isAfterLast());
        }
        catch (android.database.CursorIndexOutOfBoundsException e){
            Toast toast = Toast.makeText(this,"Poste no contiene cables",Toast.LENGTH_LONG);
            toast.setGravity(Gravity.TOP| Gravity.LEFT, 100, 310);
            toast.show();
            cables.clear();
            cableadapter.notifyDataSetChanged();
        }
        c.close();
        db.close();
    }

    @Override
    public void onClick(View v) {
        IntentIntegrator integrator = new IntentIntegrator(this);
        integrator.setCaptureActivity(CaptureActivityPortrait.class);
        //integrator.setOrientationLocked(false);
        integrator.setDesiredBarcodeFormats(IntentIntegrator.ONE_D_CODE_TYPES);
        integrator.setPrompt("Escanea Codigo de Barra");
        integrator.setCameraId(0);  // Use a specific camera of the device
        integrator.setBeepEnabled(true);
        integrator.initiateScan();
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if(result != null) {
            if(result.getContents() == null) {
                Toast.makeText(this, "Cancelado", Toast.LENGTH_SHORT).show();
            } else {
                String code=result.getContents();
                //txtCode.setText(code);
                //Toast.makeText(this, "Scanned: " + code, Toast.LENGTH_LONG).show();
                Intent intent = new Intent(this, ConfirmationActivity.class);
                intent.putExtra("barCode",code);
                intent.putExtra("posteId",posteid);
                intent.putExtra("sector",sector);
                intent.putExtra("codigoPoste",codigoposte);
                startActivity(intent);
            }
        } else {
            // This is important, otherwise the result will not be passed to the fragment
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    public void enableBlink(View view){
        EditText ncables = (EditText) view;
        ncables.setCursorVisible(true);
        InfoPoste.this.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
    }

    public void modifyNCable(View view){
        EditText cabledata = (EditText) findViewById(R.id.viewncable);
        int ncabledata = Integer.parseInt(cabledata.getText().toString());
        Log.w("ncable",Integer.toString(ncabledata));
        if(ncabledata != ncables){
            SQLiteDatabase db = myDbHelper.getReadableDatabase();
            String mySql = "UPDATE postes SET ncables = "+ncabledata+" WHERE _id = "+posteid+";";
            db.execSQL(mySql);
            db.close();
            Toast toast = Toast.makeText(this,"Número de cables modificado",Toast.LENGTH_LONG);
            toast.setGravity(Gravity.TOP| Gravity.LEFT, 50, 130);
            toast.show();
            cabledata.setCursorVisible(false);
        }
        else{
            Toast toast = Toast.makeText(this,"Modifique el número de cables primero",Toast.LENGTH_LONG);
            toast.setGravity(Gravity.TOP| Gravity.LEFT, 20, 130);
            toast.show();
        }
    }

    public void returnListaPoste(View view){
        new AlertDialog.Builder(this)
                .setTitle("Confirmación de finalizar")
                .setMessage("¿Está seguro de haber terminado de editar el poste?")
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int whichButton) {
                        SQLiteDatabase db = myDbHelper.getReadableDatabase();
                        String mySql = "UPDATE postes SET estado = 2 WHERE _id = "+posteid+";";
                        db.execSQL(mySql);
                        db.close();
                        Intent intent = new Intent(InfoPoste.this, ListadoPostes.class);
                        startActivity(intent);
                    }})
                    .setNegativeButton(android.R.string.no, null).show();
    }

    public void regresarListadoPostes(View view){
        Intent intent = new Intent(this, ListadoPostes.class);
        startActivity(intent);
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