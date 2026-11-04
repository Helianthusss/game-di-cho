import sqlite3,json,sys
req=json.loads(sys.stdin.buffer.read().decode('utf-8'))
db=sqlite3.connect(req['path'],timeout=20)
db.row_factory=sqlite3.Row
db.execute('PRAGMA foreign_keys=ON')
try:
    if req.get('schema'):
        db.executescript(req['schema']);db.commit();print('{}')
    else:
        c=db.execute(req['sql'],req.get('args',[]))
        rows=[dict(row) for row in c.fetchall()] if c.description else []
        db.commit();print(json.dumps({'results':rows,'meta':{'changes':max(0,c.rowcount)}}))
except Exception as error:
    db.rollback();print(json.dumps({'error':str(error)}))
finally: db.close()
