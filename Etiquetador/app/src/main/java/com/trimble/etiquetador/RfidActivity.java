package com.trimble.etiquetador;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.location.GpsStatus;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.SeekBar;
import android.widget.TextView;

import java.util.ArrayList;

import com.trimble.etiquetador.adapters.CodeBarAdapter;
import com.trimble.etiquetador.model.Cable;
import com.trimble.etiquetador.model.CodeBar;
import com.trimble.etiquetador.model.Position;
import com.trimble.mcs.rfid.v1.RfidConstants;
import com.trimble.mcs.rfid.v1.RfidException;
import com.trimble.mcs.rfid.v1.RfidManager;
import com.trimble.mcs.rfid.v1.RfidParameters;
import com.trimble.mcs.rfid.v1.RfidStatusCallback;
import java.util.Map;
import java.util.HashMap;
import android.widget.Toast;

import org.osgeo.proj4j.CRSFactory;
import org.osgeo.proj4j.CoordinateReferenceSystem;
import org.osgeo.proj4j.CoordinateTransform;
import org.osgeo.proj4j.CoordinateTransformFactory;
import org.osgeo.proj4j.ProjCoordinate;

public class RfidActivity extends Activity implements Observer {
    private final static String LOG_TAG = "RfidDemo";
    private BroadcastReceiver mRecvr;
    private IntentFilter mFilter;
    private boolean mScanning = false;
    private ImageButton mBtn;
    private ImageButton finalizarbtn;
    private TextView finalizartxt;
    private TextView rfidState;
    private String estado;
    private int power;
    private SeekBar seekBar;
    private int maxPower;
    private int minPower;
    private TextView txtdB;
    private ArrayList<CodeBar> codeBars=  new ArrayList<CodeBar>();
    private int numberTags;
    private ListView elements;
    private CodeBarAdapter adapter;
    private DataBaseHelper myDbHelper;
    private int posteId;
    private AlphaAnimation buttonClick = new AlphaAnimation(1F, 0.4F);
    private LocationManager locationManager;
    public String GPSstatus;
    private LocationListener locationListener;

    @Override
    public void update(final Object objeto){
        //eliminar el cable
        new AlertDialog.Builder(RfidActivity.this)
                .setTitle("Confirmación de eliminar")
                .setMessage("Se eliminará el cable con tag "+objeto)
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int whichButton) {
                        SQLiteDatabase db = myDbHelper.getReadableDatabase();
                        String mySql = "DELETE FROM cables WHERE _id = "+objeto+";";
                        db.execSQL(mySql);
                        db.close();
                        for(int i=0;i<codeBars.size();i++) {
                            CodeBar c=codeBars.get(i);
                            if(c.getCode()==objeto){
                                codeBars.remove(i);
                                if(c.getEstado()==1){
                                    numberTags--;
                                }
                                break;
                            }
                        }
                        adapter.notifyDataSetChanged();
                        ((TextView)findViewById(R.id.etData)).setText("Tags Detectados: " + numberTags +"/"+codeBars.size());
                    }})
                .setNegativeButton(android.R.string.no, null).show();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_rfid);
        posteId = getIntent().getIntExtra("posteId",0);
        estado = getIntent().getStringExtra("estado");
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        maxPower=30;
        minPower=10;
        power=maxPower;
        rfidState = (TextView) findViewById(R.id.rfidState);
        mBtn = (ImageButton)findViewById(R.id.btn_scan);
        txtdB = (TextView)findViewById(R.id.txtdB);
        configureSeekBar();
        configureListCodeBar();
        numberTags=0;
        ((TextView)findViewById(R.id.etData)).setText("Tags Detectados: " + numberTags +"/"+codeBars.size());

        mRecvr = new BroadcastReceiver() {
            public void onReceive(Context context, Intent intent) {
                onScanComplete(context, intent);
            }
        };

        mFilter = new IntentFilter();
        mFilter.addAction(RfidConstants.ACTION_RFID_TAG_SCANNED);
        mFilter.addAction(RfidConstants.ACTION_RFID_STOP_SCAN_NOTIFICATION);

        RfidStatusCallback cb = new RfidStatusCallback() {
            @Override
            public void onAPIReady() {
                // Called when RfidManager API is fully initialized.
                // Perform initial RFID configuration here.
                onRfidReady();
            }
        };

        try {
            RfidManager.init(this, RfidConstants.SESSION_SCOPE_PRIVATE, cb);
        } catch (RfidException e) {
            Log.e(LOG_TAG, "Error initializing RFID Manager.", e);
        }
        if(estado.equals("nuevo")){
            locationManager = (LocationManager)getSystemService(Context.LOCATION_SERVICE);
            locationListener = new MyLocationListener();
            locationManager.addGpsStatusListener(mGPSStatusListener);
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, locationListener);
        }
        else{
            finalizarbtn = (ImageButton) findViewById(R.id.btn_finalizar);
            finalizartxt = (TextView) findViewById(R.id.textView18);
            finalizarbtn.setVisibility(View.GONE);
            finalizartxt.setVisibility(View.GONE);
            RelativeLayout.LayoutParams lp = (RelativeLayout.LayoutParams) mBtn.getLayoutParams();
            lp.addRule(RelativeLayout.CENTER_HORIZONTAL);
            mBtn.setLayoutParams(lp);
            RelativeLayout.LayoutParams lp2 = (RelativeLayout.LayoutParams) rfidState.getLayoutParams();
            lp2.addRule(RelativeLayout.CENTER_HORIZONTAL);
            rfidState.setLayoutParams(lp2);
        }
    }

    private class MyLocationListener implements LocationListener {
        @Override
        public void onLocationChanged(final Location loc) {
        }

        @Override
        public void onProviderDisabled(String provider) {}

        @Override
        public void onProviderEnabled(String provider) {}

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {}
    }

    public GpsStatus.Listener mGPSStatusListener = new GpsStatus.Listener() {
        public void onGpsStatusChanged(int event) {
            switch(event) {
                case GpsStatus.GPS_EVENT_STARTED:
                    GPSstatus = "GPS_SEARCHING";
                    break;
                case GpsStatus.GPS_EVENT_STOPPED:
                    GPSstatus = "GPS_STOPPED";
                    break;
                case GpsStatus.GPS_EVENT_FIRST_FIX:
                    GPSstatus = "GPS_LOCKED";
                    break;
                case GpsStatus.GPS_EVENT_SATELLITE_STATUS:
                    break;
            }
        }
    };


    private void configureListCodeBar(){
        elements = (ListView) findViewById(R.id.listRfid);
        adapter = new CodeBarAdapter(this,codeBars,this);
        elements.setAdapter(adapter);
        //codeBars.add(new CodeBar("57864259", "No Detectado", "E280116060000207BF501B86"));
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        String mySql = "SELECT * FROM cables WHERE posteid="+posteId+";";
        Cursor c = db.rawQuery(mySql, null);
        codeBars.clear();
        try{
            String sqlRFID;
            Cursor c2;
            c.moveToFirst();
            do{
                String codeNumber=c.getString(c.getColumnIndex("_id"));
                sqlRFID = "SELECT * FROM match_barcode_rfid WHERE _id = '"+codeNumber+"';";
                c2 = db.rawQuery(sqlRFID, null);
                String rfid;
                if(c2.getCount() > 0){
                    c2.moveToFirst();
                    rfid = c2.getString(c2.getColumnIndex("rfid"));
                }
                else{
                    rfid="";
                }
                codeBars.add(new CodeBar(codeNumber,0,rfid));
                sqlRFID = "UPDATE cables SET rfid = '"+rfid+"' WHERE _id = '"+codeNumber+"';";
                db.execSQL(sqlRFID);
                c2.close();
                c.moveToNext();
            }while(!c.isAfterLast());
        }
        catch (android.database.CursorIndexOutOfBoundsException e){
            codeBars.clear();
            adapter.notifyDataSetChanged();
        }
        c.close();
        db.close();

    }

    private void configureSeekBar(){
        seekBar = (SeekBar) findViewById(R.id.powerBar);
        seekBar.setProgress(maxPower);
        seekBar.setMax(maxPower - minPower);
        txtdB.setText("Potencia: " + power + " dB");
        seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            int progress = 0;

            @Override
            public void onProgressChanged(SeekBar seekBar, int progresValue, boolean fromUser) {
                progress = progresValue;
                //Toast.makeText(getApplicationContext(), "Changing seekbar's progress", Toast.LENGTH_SHORT).show();
                power = progress + minPower;

                try {
                    // Set output mode to 'Intent' mode so that broadcast
                    // intents will be fired tags are scanned
                    RfidParameters parms = RfidManager.getParameters();
                    parms.setReadPower(power);
                    RfidManager.setParameters(parms);
                    txtdB.setText("Potencia: " + power + " dB");
                } catch (RfidException e) {
                    Log.e(LOG_TAG, "Error setting RFID parameters.", e);
                }
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                //Toast.makeText(getApplicationContext(), "Started tracking seekbar", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                //textView.setText("Covered: " + progress + "/" + seekBar.getMax());

            }
        });
    }

    public void finalizarPoste(View view) {
        view.startAnimation(buttonClick);
        if (numberTags == codeBars.size()) {
            if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                Toast toast = Toast.makeText(RfidActivity.this, "GPS no detectado. ¿Está apagado?", Toast.LENGTH_SHORT);
                toast.setGravity(Gravity.TOP | Gravity.LEFT, 40, 500);
                toast.show();
            } else {
                if (GPSstatus.equals("GPS_LOCKED")) {
                    Location currentLocation = locationManager.getLastKnownLocation(locationManager.GPS_PROVIDER);
                    Position currentPosition = new Position(currentLocation.getLongitude(), currentLocation.getLatitude());
                    ProjCoordinate p = getGPSProjections(currentPosition.getX(), currentPosition.getY());
                    SQLiteDatabase db = myDbHelper.getReadableDatabase();
                    String mySql = "UPDATE postes SET estado = 2 WHERE _id = " + posteId + ";";
                    db.execSQL(mySql);
                    mySql = "UPDATE postes SET x = " + p.x + ", y = " + p.y + " WHERE _id = " + posteId + ";";
                    db.execSQL(mySql);
                    db.close();
                    try {
                        if (mScanning) {
                            RfidManager.stopScan();
                            mScanning = false;
                            //seekBar.setEnabled(true);
                            rfidState.setText("Escanear");
                            ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) rfidState
                                    .getLayoutParams();
                            mlp.setMargins(53, 8, 0, 0);
                            mBtn.setBackgroundResource(R.drawable.rfidsignal80);
                        }
                        onDestroy();
                    } catch (Exception e) {
                        Log.e(LOG_TAG, "Error al finalizar ", e);
                    }
                    locationManager.removeUpdates(locationListener);
                    Intent intent = new Intent(RfidActivity.this, ListadoPostes.class);
                    startActivity(intent);
                    finish();
                } else if (GPSstatus.equals("GPS_SEARCHING")) {
                    Toast toast = Toast.makeText(RfidActivity.this, "El dispositivo se encuentra buscando el GPS", Toast.LENGTH_SHORT);
                    toast.setGravity(Gravity.TOP | Gravity.LEFT, 70, 500);
                    toast.show();
                } else if (GPSstatus.equals("GPS_STOPPED")) {
                    Toast toast = Toast.makeText(RfidActivity.this, "El GPS se detuvo", Toast.LENGTH_SHORT);
                    toast.setGravity(Gravity.TOP | Gravity.LEFT, 40, 500);
                    toast.show();
                } else {
                    Log.w("ERROR", GPSstatus);
                }
            }

        } else {
            Toast toast = Toast.makeText(RfidActivity.this, "Es necesario que se verifiquen todos los TAGS antes de poder finalizar", Toast.LENGTH_LONG);
            toast.setGravity(Gravity.TOP, 0, 520);
            toast.show();
        }
    }

    private void onRfidReady() {
        try {
            // Set output mode to 'Intent' mode so that broadcast
            // intents will be fired tags are scanned
            RfidParameters parms = RfidManager.getParameters();
            parms.setOutputMode(RfidConstants.OUTPUT_MODE_INTENT);
            parms.setReadPower(power);
            RfidManager.setParameters(parms);
        } catch (RfidException e) {
            Log.e(LOG_TAG, "Error setting RFID parameters.", e);
        }
    }

    private ProjCoordinate getGPSProjections(double x, double y){
        String csName = "EPSG:32717";
        CoordinateTransformFactory ctFactory = new CoordinateTransformFactory();
        CRSFactory csFactory = new CRSFactory(RfidActivity.this);
        CoordinateReferenceSystem crs = csFactory.createFromName(csName);
        final String WGS84_PARAM = "+title=long/lat:WGS84 +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";
        CoordinateReferenceSystem WGS84 = csFactory.createFromParameters("WGS84", WGS84_PARAM);
        CoordinateTransform trans = ctFactory.createTransform(WGS84, crs);
        ProjCoordinate p = new ProjCoordinate();
        ProjCoordinate p2 = new ProjCoordinate();
        p.x = x;
        p.y = y;
        trans.transform(p, p2);
        return p2;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            RfidManager.deinit();
        } catch (RfidException e) {
            System.out.println(e.getMessage());
        } catch (IllegalArgumentException e){
            System.out.println(e.getMessage());
        } catch (Exception e){
            System.out.println(e.getMessage());
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        registerReceiver(mRecvr, mFilter);
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceiver(mRecvr);
        if (mScanning) {
            try {
                RfidManager.stopScan();
            } catch (RfidException e) {
            }
            mScanning = false;
            rfidState.setText("Escanear");
            mBtn.setBackgroundResource(R.drawable.rfidsignal80);
        }
    }

    public void startScan(View view) {
        try {
            if (!mScanning) {
                numberTags=0;
                for(int i=0;i<codeBars.size();i++) {
                    codeBars.get(i).setEstado(0);
                }
                adapter.notifyDataSetChanged();
                RfidManager.startScan();
                mScanning = true;
                rfidState.setText("Detener");
                ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) rfidState
                        .getLayoutParams();
                mlp.setMargins(57, 8, 10, 0);
                mBtn.setBackgroundResource(R.drawable.rfidsignal100);
                seekBar.setEnabled(false);
            }
            else {
                RfidManager.stopScan();
                mScanning = false;
                //seekBar.setEnabled(true);
                rfidState.setText("Escanear");
                ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) rfidState
                        .getLayoutParams();
                mlp.setMargins(53, 8, 0, 0);
                mBtn.setBackgroundResource(R.drawable.rfidsignal80);
            }
        } catch (RfidException e) {
            Log.e(LOG_TAG, "Error attempting to start/stop scan.", e);
        }
    }

    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        try {
            if (mScanning) {
                RfidManager.stopScan();
                mScanning = false;
                //seekBar.setEnabled(true);
                rfidState.setText("Escanear");
                ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) rfidState
                        .getLayoutParams();
                mlp.setMargins(53, 8, 0, 0);
                mBtn.setBackgroundResource(R.drawable.rfidsignal80);
            }
            //onDestroy();
        } catch (Exception e) {
            Log.e(LOG_TAG, "Error on back pressed", e);
        }
        myDbHelper.close();
        if(estado.equals("nuevo"))
            locationManager.removeUpdates(locationListener);
        startActivity(new Intent(this, InfoPoste.class));
        finish();
    }

    private void onScanComplete(Context context, Intent intent) {
        String act = intent.getAction();
        if (act.equals(RfidConstants.ACTION_RFID_TAG_SCANNED)) {
            String tagId = intent.getStringExtra(RfidConstants.RFID_FIELD_ID);
            Log.d(LOG_TAG, "Tag: " + tagId);
            Log.d(LOG_TAG, tagId);
            for(int i=0;i<codeBars.size();i++){
                String currentCode=codeBars.get(i).getRfid();
                if(currentCode.equals(tagId)){
                    numberTags++;
                    codeBars.get(i).setEstado(1);
                    adapter.notifyDataSetChanged();
                    ((TextView)findViewById(R.id.etData)).setText("Tags Detectados: " + numberTags + "/" + codeBars.size());
                    break;
                }
            }
        } else if (act.equals(RfidConstants.ACTION_RFID_STOP_SCAN_NOTIFICATION)) {
            seekBar.setEnabled(true);
        }
    }
}
