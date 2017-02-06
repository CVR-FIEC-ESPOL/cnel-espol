package com.trimble.etiquetador;

import android.app.Activity;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.content.Intent;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;
import com.trimble.etiquetador.model.Poste;

public class ConfirmationActivity extends Activity implements View.OnClickListener {
    private TextView txtCode;
    private Button btnVolver;
    private int posteid;
    private String barCode;
    private String sector;
    private String codigoposte;
    private DataBaseHelper myDbHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_confirmation);
        Intent intent = getIntent();
        barCode = intent.getStringExtra("barCode");
        posteid = intent.getIntExtra("posteId",0);
        sector = intent.getStringExtra("sector");
        codigoposte = intent.getStringExtra("codigoPoste");
        btnVolver= (Button) findViewById(R.id.btnVolver);
        btnVolver.setOnClickListener(this);
        txtCode = (TextView) findViewById(R.id.txtCode);
        txtCode.setText(barCode);
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

    public void registrarCable(View view){
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
            Toast toast = Toast.makeText(this,"Ya existe un Tag con ese ID",Toast.LENGTH_LONG);
            toast.setGravity(Gravity.TOP| Gravity.LEFT, 80, 310);
            toast.show();
        }
        else{
            Intent intent = new Intent(this, RegistrarCable.class);
            intent.putExtra("barCode",barCode);
            intent.putExtra("posteId",posteid);
            intent.putExtra("sector",sector);
            intent.putExtra("codigoPoste",codigoposte);
            startActivity(intent);
        }
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if(result != null) {
            if(result.getContents() == null) {
                Toast.makeText(this, "Cancelado", Toast.LENGTH_LONG).show();
            } else {
                String code=result.getContents();
                txtCode = (TextView) findViewById(R.id.txtCode);
                txtCode.setText(code);
                barCode = code;
            }
        } else {
            // This is important, otherwise the result will not be passed to the fragment
            super.onActivityResult(requestCode, resultCode, data);
        }
    }
}
