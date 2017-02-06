package com.trimble.etiquetador;

import android.content.Context;
import android.database.Cursor;
import android.view.View;
import android.widget.ResourceCursorAdapter;
import android.widget.TextView;

public class PostesAdapter extends ResourceCursorAdapter {

    public PostesAdapter(Context context, int layout, Cursor cursor, int flags) {
        super(context, layout, cursor, flags);
    }

    @Override
    public void bindView(View view, Context context, Cursor cursor) {
        TextView name = (TextView) view.findViewById(R.id.poste_id);
        name.setText(cursor.getString(cursor.getColumnIndex("posteid")));

        TextView phone = (TextView) view.findViewById(R.id.sector);
        phone.setText(cursor.getString(cursor.getColumnIndex("sector")));
    }
}
