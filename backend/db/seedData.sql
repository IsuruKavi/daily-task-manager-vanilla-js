-- Enable UUID generation

DROP TABLE IF EXISTS Task;

CREATE TABLE IF NOT EXISTS Task(
     id UUID PRIMARY KEY ,
     task VARCHAR(100) NOT NULL,
     start_time TIME NOT NULL,
     is_complete BOOLEAN NOT NULL DEFAULT false
     );

