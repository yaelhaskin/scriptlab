FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN rm requirements.txt

RUN pip install gunicorn 

CMD ["gunicorn", "--preload", "-w", "1", "-b", "0.0.0.0:8080", "--threads", "4", "--max-requests=100", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
