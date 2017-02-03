package com.trimble.etiquetador;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ContentResolver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.widget.EditText;
import com.trimble.etiquetador.DataBaseHelper;


public class AddPoste extends Activity {
    protected DataBaseHelper myDbHelper;
    protected LocationManager locationMng=null;
    protected LocationListener locationListener=null;
    protected double latitud = 0;
    protected double longitud = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_poste);
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        } catch (SQLException sqle) {
            throw sqle;
        }
        locationMng = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    }

    protected void addPoste(View view) {
        if(displayGpsStatus()){
            String codigo = ((EditText) findViewById(R.id.codigo)).getText().toString();
            String sector = ((EditText) findViewById(R.id.sector)).getText().toString();
            locationListener = new MyLocationListener();
            locationMng.requestLocationUpdates(LocationManager
                    .GPS_PROVIDER, 5000, 10,locationListener);

            SQLiteDatabase db = myDbHelper.getReadableDatabase();
            String mySQLquery = "INSERT INTO postes (posteid,sector,x,y,usuario) VALUES ("+codigo+","+sector+","+String.valueOf(longitud)+","+String.valueOf(latitud)+","+"cnel"+") ;";
            db.execSQL(mySQLquery);
        }else {
            alertbox("GPS STATUS", "Your GPS is OFF");
        }


    }

    private class MyLocationListener implements LocationListener {
        @Override
        public void onLocationChanged(Location loc) {
            longitud = loc.getLongitude();
            latitud = loc.getLatitude();
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {
        }

        @Override
        public void onProviderEnabled(String provider) {

        }

        @Override
        public void onProviderDisabled(String provider) {

        }
    }

    /*----Method to Check GPS is enable or disable ----- */
    private Boolean displayGpsStatus() {
        ContentResolver contentResolver = getBaseContext()
                .getContentResolver();
        boolean gpsStatus = Settings.Secure
                .isLocationProviderEnabled(contentResolver,
                        LocationManager.GPS_PROVIDER);
        if (gpsStatus) {
            return true;

        } else {
            return false;
        }
    }

    /*----------Method to create an AlertBox ------------- */
    protected void alertbox(String title, String mymessage) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setMessage("Your Device's GPS is Disable")
                .setCancelable(false)
                .setTitle("** Gps Status **")
                .setPositiveButton("Gps On",
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                // finish the current activity
                                // AlertBoxAdvance.this.finish();
                                Intent myIntent = new Intent(
                                        Settings.ACTION_SECURITY_SETTINGS);
                                startActivity(myIntent);
                                dialog.cancel();
                            }
                        })
                .setNegativeButton("Cancel",
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                // cancel the dialog box
                                dialog.cancel();
                            }
                        });
        AlertDialog alert = builder.create();
        alert.show();
    }
}