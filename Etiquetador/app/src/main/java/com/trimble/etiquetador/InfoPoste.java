package com.trimble.etiquetador;

import android.app.Activity;
import java.util.UUID;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.text.InputFilter;
import android.text.Spanned;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;


public class InfoPoste extends Activity implements View.OnClickListener {
    private ImageButton boton;
    DataBaseHelper myDbHelper;
    private static int posteid;
    private static String codigoposte;
    private static String sector;
    private static int ncables;
    private static String ventana;
    private static String uuid;
    private AlphaAnimation buttonClick = new AlphaAnimation(1F, 0.4F);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_info_poste);
        boton = (ImageButton) findViewById(R.id.boton);
        boton.setOnClickListener(this);
        Intent intent = getIntent();
        if(intent.getIntExtra("IdPoste",0) != 0){
            posteid = intent.getIntExtra("IdPoste",0);
            codigoposte = intent.getStringExtra("CodigoPoste");
            sector = intent.getStringExtra("Sector");
            ncables = intent.getIntExtra("NCables",0);
            ventana = intent.getStringExtra("Ventana");
            uuid = intent.getStringExtra("uuid");
        }
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql;
        if(uuid.isEmpty()){
            UUID idUnique;
            do{
                idUnique = UUID.randomUUID();
                uuid = idUnique.toString();
            }while(uuid.equals("0"));
            mySql = "UPDATE postes SET uuid = '"+uuid+"' WHERE _id = "+posteid+";";
            db.execSQL(mySql);
        }
        db.close();
        TextView viewcodigoPoste = (TextView) findViewById(R.id.viewcodigo);
        TextView viewsector = (TextView) findViewById(R.id.viewsector);
        EditText viewncable = (EditText) findViewById(R.id.viewncable);
        viewcodigoPoste.setText(codigoposte);
        viewsector.setText(sector);
        viewncable.setText(Integer.toString(ncables));
        viewncable.setFilters(new InputFilter[]{ new InputFilterMinMax("0", "99")});
        viewncable.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ((EditText) v).setText("");
            }
        });
        ((TextView) findViewById(R.id.viewncable)).setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    String ncable = v.getText().toString();
                    if(!ncable.equals("")){
                        int ncabledata = Integer.parseInt(ncable);
                        if(ncabledata != ncables){
                            SQLiteDatabase db = myDbHelper.getReadableDatabase();
                            String mySql = "UPDATE postes SET ncables = "+ncabledata+" WHERE _id = "+posteid+";";
                            db.execSQL(mySql);
                            db.close();
                            v.setCursorVisible(false);
                            ncables = ncabledata;
                        }
                    }
                }
                return false;
            }
        });
    }

    public void openRfid(View view){
        view.startAnimation(buttonClick);
        Intent rfidIntent = new Intent(this,RfidActivity.class);
        if(ventana.equals("finalizados"))
            rfidIntent.putExtra("estado","finalizado");
        else
            rfidIntent.putExtra("estado","nuevo");
        rfidIntent.putExtra("posteId",posteid);
        myDbHelper.close();
        startActivity(rfidIntent);
        finish();
    }

    public void escanear(){
        IntentIntegrator integrator = new IntentIntegrator(this);
        integrator.setCaptureActivity(CaptureActivityPortrait.class);
        integrator.setDesiredBarcodeFormats(IntentIntegrator.ONE_D_CODE_TYPES);
        integrator.setPrompt("Escanea Codigo de Barra");
        integrator.setCameraId(0);  // Use a specific camera of the device
        integrator.setBeepEnabled(true);
        integrator.initiateScan();
    }

    @Override
    public void onClick(View v) {
        v.startAnimation(buttonClick);
        escanear();
    }

    public void registrarCable(String barCode){
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT _id FROM cables WHERE _id = '"+barCode+"';";
        Cursor c = db.rawQuery(mySql, null);
        if(c.getCount() == 1){
            Toast toast = Toast.makeText(this,"Tag Repetido",Toast.LENGTH_LONG);
            toast.setGravity(Gravity.TOP| Gravity.LEFT, 80, 310);
            ViewGroup group = (ViewGroup) toast.getView();
            TextView messageTextView = (TextView) group.getChildAt(0);
            messageTextView.setTextSize(40);
            toast.show();
        }
        else{
            mySql = "INSERT INTO cables (_id,posteid,tipo,escable,operadora) VALUES ('"+barCode+"','"+posteid+"','NA',0,'NA');";
            db.execSQL(mySql);
            Toast toast = Toast.makeText(this,barCode,Toast.LENGTH_LONG);
            toast.setGravity(Gravity.TOP | Gravity.LEFT, 80, 310);
            ViewGroup group = (ViewGroup) toast.getView();
            TextView messageTextView = (TextView) group.getChildAt(0);
            messageTextView.setTextSize(40);
            toast.show();
        }
        c.close();
        db.close();
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if(result != null) {
            if(result.getContents() != null) {
                String code=result.getContents();
                registrarCable(code);
                escanear();
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

    public void cablesFeatures(View view){
        view.startAnimation(buttonClick);
        Intent intent = new Intent(this,ListadoCables.class);
        intent.putExtra("posteid",posteid);
        intent.putExtra("codigoposte",codigoposte);
        myDbHelper.close();
        startActivity(intent);
        finish();
    }

    public void takePictures(View view){
        view.startAnimation(buttonClick);
        Intent intent = new Intent(this,Fotos_Trimble.class);
        intent.putExtra("uuid",uuid);
        myDbHelper.close();
        startActivity(intent);
        finish();
    }

    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        if(ventana.equals("listado"))
            startActivity(new Intent(this, ListadoPostes.class));
        else if(ventana.equals("pendientes"))
            startActivity(new Intent(this, PostesPendientes.class));
        else if(ventana.equals("finalizados"))
            startActivity(new Intent(this, listaFinalizados.class));
        myDbHelper.close();
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