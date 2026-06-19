CREATE DATABASE IF NOT EXISTS anime_physique;
USE anime_physique;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    anime VARCHAR(100) NOT NULL,
    difficulty ENUM('intermediate','advanced','elite','legendary','impossible') NOT NULL,
    gender ENUM('male','female') NOT NULL,
    height_cm FLOAT NOT NULL,
    weight_kg FLOAT NOT NULL,
    body_fat_percent FLOAT NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

CREATE TABLE physique_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    character_id INT NOT NULL,
    user_height_cm FLOAT NOT NULL,
    user_weight_kg FLOAT NOT NULL,
    user_body_fat FLOAT NOT NULL,
    match_percent FLOAT NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id)
);

CREATE TABLE roadmaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    character_id INT NOT NULL,
    training_days INT NOT NULL,
    diet_type VARCHAR(50),
    experience_level VARCHAR(50),
    roadmap_text LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id)
);

INSERT INTO characters (name, anime, difficulty, gender, height_cm, weight_kg, body_fat_percent, description, image_url) VALUES

-- Demon Slayer
('Tanjiro Kamado', 'Demon Slayer', 'intermediate', 'male', 165, 61, 12, 'Athletic demon slayer with exceptional endurance and explosive power', ''),
('Inosuke Hashibira', 'Demon Slayer', 'advanced', 'male', 164, 75, 8, 'Wild physique built purely through nature, insane flexibility and muscle density', ''),
('Tengen Uzui', 'Demon Slayer', 'elite', 'male', 198, 110, 7, 'Sound Hashira with a massive powerful frame and elite conditioning', ''),

-- Jujutsu Kaisen
('Yuji Itadori', 'Jujutsu Kaisen', 'intermediate', 'male', 173, 80, 13, 'Naturally gifted athlete with monstrous strength', ''),
('Toji Fushiguro', 'Jujutsu Kaisen', 'advanced', 'male', 190, 97, 8, 'Peak human specimen with elite muscle mass and low body fat', ''),
('Nanami Kento', 'Jujutsu Kaisen', 'advanced', 'male', 184, 93, 10, 'Disciplined and powerful sorcerer with a thick powerful build', ''),

-- Baki
('Baki Hanma', 'Baki', 'elite', 'male', 168, 78, 6, 'Underground fighting champion with near-perfect muscularity', ''),
('Yujiro Hanma', 'Baki', 'legendary', 'male', 190, 120, 5, 'The strongest creature on earth, impossible muscularity', ''),
('Doppo Orochi', 'Baki', 'elite', 'male', 178, 88, 7, 'Karate grandmaster with a rock solid powerful physique', ''),

-- One Punch Man
('Garou', 'One Punch Man', 'elite', 'male', 185, 95, 7, 'Human monster with perfect combat physique', ''),
('Bang', 'One Punch Man', 'advanced', 'male', 170, 79, 9, 'Ancient martial arts master with a deceptively powerful build', ''),
('King', 'One Punch Man', 'intermediate', 'male', 188, 83, 15, 'Tall frame with average conditioning, strongest man on surface only', ''),

-- My Hero Academia
('All Might', 'My Hero Academia', 'impossible', 'male', 220, 255, 4, 'Symbol of peace with superhuman proportions', ''),
('Endeavor', 'My Hero Academia', 'legendary', 'male', 195, 125, 6, 'Flame hero with a massive intimidating physique', ''),
('Muscular', 'My Hero Academia', 'elite', 'male', 190, 115, 8, 'Augmented muscle villain with terrifying mass', ''),

-- Naruto
('Rock Lee', 'Naruto', 'advanced', 'male', 172, 57, 7, 'Pure taijutsu specialist, shredded and incredibly conditioned', ''),
('Might Guy', 'Naruto', 'elite', 'male', 184, 92, 7, 'Eight gates taijutsu master with peak human conditioning', ''),
('Kisame Hoshigaki', 'Naruto', 'elite', 'male', 195, 105, 9, 'Shark-like monster with massive powerful frame', ''),
('Jiraiya', 'Naruto', 'advanced', 'male', 191, 102, 12, 'Legendary Sannin with a big powerful battle-hardened body', ''),

-- Dragon Ball
('Goku', 'Dragon Ball Z', 'legendary', 'male', 175, 85, 5, 'Saiyan warrior with a perfectly balanced powerful physique', ''),
('Vegeta', 'Dragon Ball Z', 'legendary', 'male', 164, 78, 5, 'Prince of Saiyans, compact and incredibly dense muscle', ''),
('Piccolo', 'Dragon Ball Z', 'elite', 'male', 226, 116, 6, 'Namekian warrior with a tall lean powerful frame', ''),
('Broly', 'Dragon Ball Z', 'impossible', 'male', 198, 135, 4, 'Legendary Super Saiyan with the most absurd mass imaginable', ''),

-- One Piece
('Roronoa Zoro', 'One Piece', 'elite', 'male', 181, 85, 7, 'Swordsman with an incredibly thick powerful physique from constant training', ''),
('Monkey D Luffy', 'One Piece', 'intermediate', 'male', 174, 64, 10, 'Lean and athletic with surprising functional strength', ''),
('Sanji', 'One Piece', 'advanced', 'male', 180, 80, 9, 'Lean powerful build optimised for explosive kicking speed', ''),
('Whitebeard', 'One Piece', 'impossible', 'male', 666, 250, 8, 'Worlds strongest man with an absolutely enormous frame', ''),
('Portgas D Ace', 'One Piece', 'advanced', 'male', 185, 85, 8, 'Lean athletic fire user with a naturally gifted physique', ''),

-- Attack on Titan
('Levi Ackerman', 'Attack on Titan', 'elite', 'male', 160, 65, 7, 'Humanitys strongest soldier, compact and explosively powerful', ''),
('Eren Yeager', 'Attack on Titan', 'advanced', 'male', 183, 82, 10, 'Hardened soldier with a lean athletic battle-ready physique', ''),
('Reiner Braun', 'Attack on Titan', 'elite', 'male', 188, 100, 9, 'Armored titan warrior with a massive thick powerful build', ''),

-- JoJo Bizarre Adventure
('Jonathan Joestar', 'JoJo Bizarre Adventure', 'elite', 'male', 195, 105, 7, 'Victorian era gentleman with massive natural physique', ''),
('Josuke Higashikata', 'JoJo Bizarre Adventure', 'advanced', 'male', 180, 82, 10, 'Tall and powerfully built high schooler', ''),

-- Kengan Ashura
('Ohma Tokita', 'Kengan Ashura', 'elite', 'male', 181, 82, 7, 'Underground fighter with a perfectly conditioned combat physique', ''),
('Agito Kanoh', 'Kengan Ashura', 'legendary', 'male', 183, 90, 6, 'Fang of Metsudo with a flawless shredded physique', ''),
-- Female Characters

-- Jujutsu Kaisen
('Maki Zenin', 'Jujutsu Kaisen', 'elite', 'female', 170, 62, 12, 'Zero cursed energy but physically the most conditioned sorcerer alive, lean and explosive', ''),
('Nobara Kugisaki', 'Jujutsu Kaisen', 'intermediate', 'female', 160, 54, 18, 'Athletic and scrappy fighter with solid functional conditioning', ''),

-- Demon Slayer
('Mitsuri Kanroji', 'Demon Slayer', 'elite', 'female', 167, 56, 14, 'Love Hashira with uniquely dense muscle fibers, deceptively powerful and flexible', ''),
('Shinobu Kocho', 'Demon Slayer', 'advanced', 'female', 151, 44, 15, 'Insect Hashira with an incredibly lean small frame built for speed and agility', ''),

-- Attack on Titan
('Mikasa Ackerman', 'Attack on Titan', 'elite', 'female', 170, 68, 11, 'Ackerman clan prodigy with a lean powerful athletic build, top soldier of her generation', ''),
('Annie Leonhart', 'Attack on Titan', 'advanced', 'female', 153, 54, 13, 'Female titan shifter with compact explosive power and elite martial arts conditioning', ''),

-- Naruto
('Tsunade', 'Naruto', 'legendary', 'female', 163, 48, 13, 'Legendary Sannin with superhuman strength hidden in a deceptively lean frame', ''),
('Sakura Haruno', 'Naruto', 'advanced', 'female', 161, 50, 16, 'Medical ninja with monstrous punching power and solid athletic conditioning', ''),

-- Dragon Ball
('Android 18', 'Dragon Ball Z', 'legendary', 'female', 165, 55, 14, 'Infinite energy android with a lean powerful build that surpasses any human limit', ''),
('Caulifla', 'Dragon Ball Z', 'elite', 'female', 157, 52, 13, 'Saiyan prodigy with natural talent and a lean athletic physique', ''),

-- One Piece
('Boa Hancock', 'One Piece', 'advanced', 'female', 191, 68, 15, 'Tall and statuesque warlord with an elite lean and powerful build', ''),
('Nami', 'One Piece', 'intermediate', 'female', 170, 57, 20, 'Athletic navigator with a lean everyday physique', ''),
('Robin', 'One Piece', 'intermediate', 'female', 188, 62, 18, 'Tall lean archaeologist with a naturally slender powerful frame', ''),

-- My Hero Academia
('Mirko', 'My Hero Academia', 'legendary', 'female', 159, 58, 10, 'Rabbit hero with the most shredded powerful physique of any female pro hero', ''),
('Midnight', 'My Hero Academia', 'advanced', 'female', 172, 58, 17, 'Mature hero with a tall athletic build', ''),

-- Kengan Ashura
('IoriOmotobe', 'Kengan Ashura', 'advanced', 'female', 165, 57, 14, 'Disciplined martial artist with a lean conditioned physique', ''),

-- One Punch Man
('Fubuki', 'One Punch Man', 'intermediate', 'female', 167, 55, 18, 'Esper with a lean natural physique, not combat trained but naturally athletic', ''),
('Tatsumaki', 'One Punch Man', 'advanced', 'female', 140, 37, 15, 'Deceptively small but the most powerful esper alive, lean and wiry', '');