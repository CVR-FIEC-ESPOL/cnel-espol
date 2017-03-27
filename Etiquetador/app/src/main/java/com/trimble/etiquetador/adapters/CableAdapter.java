package com.trimble.etiquetador.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.trimble.etiquetador.R;
import com.trimble.etiquetador.model.Cable;

import java.util.ArrayList;

public class CableAdapter extends ArrayAdapter<Cable> {
    private ArrayList<Cable> cables;
    private Context context;

    public CableAdapter(Context context, ArrayList<Cable> cables){
        super(context,0,cables);
        this.context = context;
        this.cables = cables;
    }

    static class ViewHolder{
        TextView tagid;
        TextView operadora;
        TextView tipo;
        ImageView viewcables;
        ImageView viewoperadora;
    }
    @Override
    public View getView(int position, View convertView, ViewGroup parent){
        if(convertView == null){
            convertView = LayoutInflater.from(context).inflate(R.layout.cable_item,parent,false);
            ViewHolder viewHolder = new ViewHolder();
            viewHolder.tagid = (TextView) convertView.findViewById(R.id.viewtagid);
            viewHolder.operadora = (TextView) convertView.findViewById(R.id.viewoperadora);
            viewHolder.tipo = (TextView) convertView.findViewById(R.id.viewtipo);
            viewHolder.viewcables = (ImageView) convertView.findViewById(R.id.viewcables);
            viewHolder.viewoperadora = (ImageView) convertView.findViewById(R.id.viewimageoperadora);
            convertView.setTag(viewHolder);
        }
        ViewHolder holder = (ViewHolder) convertView.getTag();
        final Cable currentCable = this.cables.get(position);
        holder.tagid.setText(currentCable.getTagid());
        if(currentCable.isEscable() == 1){
            holder.viewcables.setBackgroundResource(R.drawable.cablerelease96);
            holder.operadora.setText(currentCable.getOperadora_name());
            holder.tipo.setText(currentCable.getTipo());
        }
        else if(currentCable.isEscable() == 2){
            holder.viewcables.setBackgroundResource(R.drawable.rj4580);
            holder.tipo.setText(currentCable.getTipo());
            holder.operadora.setVisibility(View.INVISIBLE);
            holder.viewoperadora.setVisibility(View.INVISIBLE);
        }
        return convertView;
    }
}
