import sys,sqlite3,json
db=sqlite3.connect(sys.argv[1],timeout=20)
db.row_factory=sqlite3.Row
db.execute('PRAGMA foreign_keys=ON')
for raw in sys.stdin.buffer:
    req=json.loads(raw.decode('utf-8'))
    try:
        if req.get('schema'):
            db.executescript(req['schema']);db.commit();result={}
        else:
            c=db.execute(req['sql'],req.get('args',[]))
            rows=[dict(row) for row in c.fetchall()] if c.description else []
            db.commit();result={'results':rows,'meta':{'changes':max(0,c.rowcount)}}
        print(json.dumps({'id':req['id'],'result':result}),flush=True)
    except Exception as error:
        db.rollback();print(json.dumps({'id':req['id'],'error':str(error)}),flush=True)
