FROM python:3-slim-buster
WORKDIR /app

RUN apt-get update && apt-get install -y git doxygen

COPY requirements.txt ./
RUN python3 -m pip install -r requirements.txt

COPY . .

CMD ["python3", "app.py"]
