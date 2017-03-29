var results refcursor;
exec select_tags('{247F8050-1182-4D2C-8AC9-16B236C6131A}','rodrigo',:results);
print results
exec update_tag('rodrigo','{247F8050-1182-4D2C-8AC9-16B236C6131A}','105');
exec update_tag('null','{247F8050-1182-4D2C-8AC9-16B236C6131A}','105');
exec update_tag('rodrigo','{247F8050-1182-4D2C-8AC9-16B236C6131A}','106');
exec select_tags('{247F8050-1182-4D2C-8AC9-16B236C6131A}','rodrigo',:results);
print results
