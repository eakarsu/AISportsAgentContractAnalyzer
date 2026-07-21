-- Clear existing data
TRUNCATE users, contracts, salary_caps, endorsements, free_agents, negotiations, performance, draft_scouting, injury_reports, team_rosters, trade_analysis, clients, financials, league_rules RESTART IDENTITY CASCADE;

-- The guarded seed runner creates an administrator from environment-supplied credentials.

-- ============================================================
-- 1. CONTRACTS (16 entries)
-- ============================================================
INSERT INTO contracts (player_name, team, league, position, contract_value, annual_salary, contract_years, signing_bonus, guaranteed_money, status, start_date, end_date) VALUES
('Patrick Mahomes', 'Kansas City Chiefs', 'NFL', 'Quarterback', 450000000.00, 45000000.00, 10, 10000000.00, 141481905.00, 'Active', '2020-07-06', '2031-07-06'),
('Dak Prescott', 'Dallas Cowboys', 'NFL', 'Quarterback', 240000000.00, 60000000.00, 4, 46000000.00, 231000000.00, 'Active', '2024-09-01', '2028-03-01'),
('LeBron James', 'Los Angeles Lakers', 'NBA', 'Forward', 104300000.00, 52150000.00, 2, 0.00, 104300000.00, 'Active', '2024-07-01', '2026-06-30'),
('Stephen Curry', 'Golden State Warriors', 'NBA', 'Guard', 215353664.00, 53838416.00, 4, 0.00, 215353664.00, 'Active', '2022-07-01', '2026-06-30'),
('Shohei Ohtani', 'Los Angeles Dodgers', 'MLB', 'Pitcher/DH', 700000000.00, 70000000.00, 10, 0.00, 700000000.00, 'Active', '2024-02-01', '2034-01-31'),
('Mike Trout', 'Los Angeles Angels', 'MLB', 'Center Fielder', 426500000.00, 35541667.00, 12, 0.00, 426500000.00, 'Active', '2019-03-20', '2030-12-31'),
('Aaron Judge', 'New York Yankees', 'MLB', 'Outfielder', 360000000.00, 40000000.00, 9, 0.00, 360000000.00, 'Active', '2022-12-21', '2031-12-20'),
('Connor McDavid', 'Edmonton Oilers', 'NHL', 'Center', 100000000.00, 12500000.00, 8, 0.00, 100000000.00, 'Active', '2017-07-01', '2026-06-30'),
('Erling Haaland', 'Manchester City', 'Premier League', 'Forward', 200000000.00, 40000000.00, 5, 30000000.00, 150000000.00, 'Active', '2023-07-01', '2028-06-30'),
('Kylian Mbappe', 'Real Madrid', 'La Liga', 'Forward', 250000000.00, 50000000.00, 5, 100000000.00, 250000000.00, 'Active', '2024-07-01', '2029-06-30'),
('Joe Burrow', 'Cincinnati Bengals', 'NFL', 'Quarterback', 275000000.00, 55000000.00, 5, 30000000.00, 219010000.00, 'Active', '2023-09-01', '2028-03-01'),
('Jaylen Brown', 'Boston Celtics', 'NBA', 'Guard/Forward', 303660000.00, 50610000.00, 5, 0.00, 303660000.00, 'Active', '2024-07-01', '2029-06-30'),
('Mookie Betts', 'Los Angeles Dodgers', 'MLB', 'Outfielder', 365000000.00, 30416667.00, 12, 0.00, 365000000.00, 'Active', '2020-07-22', '2032-07-21'),
('Auston Matthews', 'Toronto Maple Leafs', 'NHL', 'Center', 53000000.00, 13250000.00, 4, 0.00, 53000000.00, 'Active', '2024-07-01', '2028-06-30'),
('Jude Bellingham', 'Real Madrid', 'La Liga', 'Midfielder', 150000000.00, 25000000.00, 6, 20000000.00, 100000000.00, 'Active', '2023-07-01', '2029-06-30'),
('Travis Kelce', 'Kansas City Chiefs', 'NFL', 'Tight End', 34250000.00, 17125000.00, 2, 0.00, 17125000.00, 'Active', '2024-04-01', '2026-03-31');

-- ============================================================
-- 2. SALARY CAPS (16 entries)
-- ============================================================
INSERT INTO salary_caps (team, league, total_cap, current_spending, cap_space, dead_money, num_players, top_paid_player, top_salary, cap_utilization, season) VALUES
('Kansas City Chiefs', 'NFL', 255400000.00, 242600000.00, 12800000.00, 8500000.00, 53, 'Patrick Mahomes', 45000000.00, 95.00, '2025-2026'),
('Dallas Cowboys', 'NFL', 255400000.00, 268000000.00, -12600000.00, 22000000.00, 53, 'Dak Prescott', 60000000.00, 104.93, '2025-2026'),
('Buffalo Bills', 'NFL', 255400000.00, 238000000.00, 17400000.00, 5200000.00, 53, 'Josh Allen', 43000000.00, 93.19, '2025-2026'),
('Los Angeles Lakers', 'NBA', 140588000.00, 178500000.00, -37912000.00, 4200000.00, 15, 'LeBron James', 52150000.00, 126.96, '2025-2026'),
('Golden State Warriors', 'NBA', 140588000.00, 195000000.00, -54412000.00, 2100000.00, 15, 'Stephen Curry', 53838416.00, 138.70, '2025-2026'),
('Boston Celtics', 'NBA', 140588000.00, 182000000.00, -41412000.00, 1800000.00, 15, 'Jaylen Brown', 50610000.00, 129.45, '2025-2026'),
('New York Yankees', 'MLB', 0.00, 310000000.00, 0.00, 15000000.00, 26, 'Aaron Judge', 40000000.00, 0.00, '2025'),
('Los Angeles Dodgers', 'MLB', 0.00, 345000000.00, 0.00, 12000000.00, 26, 'Shohei Ohtani', 70000000.00, 0.00, '2025'),
('Edmonton Oilers', 'NHL', 88000000.00, 84500000.00, 3500000.00, 1200000.00, 23, 'Connor McDavid', 12500000.00, 96.02, '2025-2026'),
('Toronto Maple Leafs', 'NHL', 88000000.00, 86200000.00, 1800000.00, 3500000.00, 23, 'Auston Matthews', 13250000.00, 97.95, '2025-2026'),
('Manchester City', 'Premier League', 0.00, 280000000.00, 0.00, 0.00, 25, 'Erling Haaland', 40000000.00, 0.00, '2025-2026'),
('Real Madrid', 'La Liga', 0.00, 350000000.00, 0.00, 0.00, 25, 'Kylian Mbappe', 50000000.00, 0.00, '2025-2026'),
('Cincinnati Bengals', 'NFL', 255400000.00, 247800000.00, 7600000.00, 3800000.00, 53, 'Joe Burrow', 55000000.00, 97.02, '2025-2026'),
('Philadelphia Eagles', 'NFL', 255400000.00, 260000000.00, -4600000.00, 18000000.00, 53, 'Jalen Hurts', 51000000.00, 101.80, '2025-2026'),
('Miami Heat', 'NBA', 140588000.00, 155000000.00, -14412000.00, 6500000.00, 15, 'Jimmy Butler', 48798677.00, 110.25, '2025-2026'),
('Tampa Bay Buccaneers', 'NFL', 255400000.00, 230000000.00, 25400000.00, 9200000.00, 53, 'Baker Mayfield', 40000000.00, 90.06, '2025-2026');

-- ============================================================
-- 3. ENDORSEMENTS (16 entries)
-- ============================================================
INSERT INTO endorsements (player_name, brand, deal_type, deal_value, duration_years, sport, social_media_followers, market_reach, status, category, start_date, end_date) VALUES
('LeBron James', 'Nike', 'Lifetime', 1000000000.00, 99, 'Basketball', 214000000, 'Global', 'Active', 'Footwear & Apparel', '2015-12-01', '2114-12-01'),
('Patrick Mahomes', 'Adidas', 'Signature Shoe', 25000000.00, 5, 'Football', 15000000, 'North America', 'Active', 'Footwear', '2023-01-01', '2028-01-01'),
('Stephen Curry', 'Under Armour', 'Brand Partnership', 35000000.00, 5, 'Basketball', 52000000, 'Global', 'Active', 'Footwear & Apparel', '2022-01-01', '2027-01-01'),
('Shohei Ohtani', 'New Balance', 'Signature Deal', 30000000.00, 5, 'Baseball', 8000000, 'Global', 'Active', 'Footwear', '2024-01-01', '2029-01-01'),
('Erling Haaland', 'Nike', 'Brand Ambassador', 20000000.00, 4, 'Soccer', 40000000, 'Global', 'Active', 'Footwear & Apparel', '2024-07-01', '2028-07-01'),
('Kylian Mbappe', 'Nike', 'Signature Boot', 22000000.00, 5, 'Soccer', 110000000, 'Global', 'Active', 'Footwear', '2023-01-01', '2028-01-01'),
('Travis Kelce', 'Pfizer', 'Brand Ambassador', 8000000.00, 3, 'Football', 12000000, 'North America', 'Active', 'Healthcare', '2024-01-01', '2027-01-01'),
('Aaron Judge', 'Pepsi', 'Campaign', 5000000.00, 2, 'Baseball', 4500000, 'North America', 'Active', 'Beverage', '2024-03-01', '2026-03-01'),
('Connor McDavid', 'CCM Hockey', 'Equipment Deal', 4000000.00, 5, 'Hockey', 3500000, 'North America', 'Active', 'Equipment', '2023-01-01', '2028-01-01'),
('Jaylen Brown', 'Dior', 'Brand Ambassador', 10000000.00, 3, 'Basketball', 8000000, 'Global', 'Active', 'Luxury Fashion', '2024-06-01', '2027-06-01'),
('Jude Bellingham', 'Adidas', 'Brand Ambassador', 15000000.00, 5, 'Soccer', 30000000, 'Global', 'Active', 'Footwear & Apparel', '2023-07-01', '2028-07-01'),
('Joe Burrow', 'Bose', 'Brand Partnership', 6000000.00, 3, 'Football', 6500000, 'North America', 'Active', 'Electronics', '2024-01-01', '2027-01-01'),
('Mookie Betts', 'Jordan Brand', 'Signature Deal', 8000000.00, 4, 'Baseball', 3000000, 'North America', 'Active', 'Footwear', '2023-01-01', '2027-01-01'),
('Dak Prescott', 'Sleep Number', 'Brand Ambassador', 3000000.00, 3, 'Football', 5000000, 'North America', 'Active', 'Lifestyle', '2024-01-01', '2027-01-01'),
('Mike Trout', 'Subway', 'Campaign', 4000000.00, 2, 'Baseball', 5200000, 'North America', 'Active', 'Food & Beverage', '2024-04-01', '2026-04-01'),
('Auston Matthews', 'Biosteel', 'Equity Partner', 5000000.00, 5, 'Hockey', 2500000, 'North America', 'Active', 'Sports Nutrition', '2022-01-01', '2027-01-01');

-- ============================================================
-- 4. FREE AGENTS (16 entries)
-- ============================================================
INSERT INTO free_agents (player_name, previous_team, league, position, age, years_experience, last_contract_value, projected_value, market_demand, injury_history, stats_summary, agent_name, status) VALUES
('Saquon Barkley', 'Philadelphia Eagles', 'NFL', 'Running Back', 28, 7, 37750000.00, 40000000.00, 'High', 'ACL tear (2020), ankle sprains', '2000 rushing yards in 2024, 13 TDs, Pro Bowl selection', 'David Mulugheta', 'Available'),
('Derrick Henry', 'Baltimore Ravens', 'NFL', 'Running Back', 31, 9, 16000000.00, 12000000.00, 'Medium', 'Foot fracture (2021)', '1407 rushing yards, 14 TDs in 2024', 'David Mulugheta', 'Available'),
('Paul George', 'Philadelphia 76ers', 'NBA', 'Forward', 35, 14, 49350000.00, 35000000.00, 'Medium', 'Knee issues, hamstring', '22.6 PPG, 5.2 RPG, 3.5 APG career averages', 'Aaron Mintz', 'Available'),
('Juan Soto', 'New York Mets', 'MLB', 'Outfielder', 27, 7, 765000000.00, 50000000.00, 'High', 'Minor back soreness', '.285 AVG, 35 HR, 105 RBI in 2024', 'Scott Boras', 'Signed'),
('Pete Alonso', 'New York Mets', 'MLB', 'First Baseman', 30, 6, 20500000.00, 25000000.00, 'Medium', 'Wrist issues', '34 HR, 88 RBI, .240 AVG in 2024', 'Scott Boras', 'Available'),
('Vladimir Tarasenko', 'Detroit Red Wings', 'NHL', 'Right Wing', 33, 12, 4750000.00, 3000000.00, 'Low', 'Multiple shoulder surgeries', '23 goals, 32 assists in 2024', 'Craig Oster', 'Available'),
('Marcus Smart', 'Memphis Grizzlies', 'NBA', 'Guard', 31, 11, 18833712.00, 12000000.00, 'Medium', 'Ankle sprains, foot surgery', 'DPOY 2023, 14.2 PPG, 5.1 APG', 'Happy Walters', 'Available'),
('Kirk Cousins', 'Atlanta Falcons', 'NFL', 'Quarterback', 37, 13, 180000000.00, 30000000.00, 'Low', 'Achilles tear (2023)', '4044 passing yards, 18 TDs in 2024', 'Mike McCartney', 'Available'),
('Willian', 'Fulham', 'Premier League', 'Winger', 36, 16, 5000000.00, 2000000.00, 'Low', 'Muscle injuries', '3 goals, 5 assists in 2024', 'Kia Joorabchian', 'Available'),
('Christian McCaffrey', 'San Francisco 49ers', 'NFL', 'Running Back', 29, 8, 64000000.00, 45000000.00, 'High', 'Achilles tendinitis', '1459 rushing, 564 receiving yards, 21 TDs in 2023', 'Creative Artists Agency', 'Available'),
('Lamar Jackson', 'Baltimore Ravens', 'NFL', 'Quarterback', 29, 7, 260000000.00, 55000000.00, 'High', 'Knee injury (2022)', '2 MVP awards, 3800 pass yards, 800 rush yards', 'Self-represented', 'Signed'),
('DeMar DeRozan', 'Sacramento Kings', 'NBA', 'Guard/Forward', 36, 15, 40000000.00, 15000000.00, 'Medium', 'Minor knee issues', '24.0 PPG, 5.3 RPG, 4.3 APG in 2024', 'Aaron Goodwin', 'Available'),
('Blake Snell', 'Los Angeles Dodgers', 'MLB', 'Pitcher', 32, 9, 62000000.00, 25000000.00, 'Medium', 'Groin strain', '2 Cy Young Awards, 3.12 ERA in 2024', 'Scott Boras', 'Available'),
('Mohamed Salah', 'Liverpool', 'Premier League', 'Forward', 33, 12, 45000000.00, 40000000.00, 'High', 'Minor muscle issues', '19 goals, 13 assists in 2024-25', 'Ramy Abbas Issa', 'Available'),
('Leon Draisaitl', 'Edmonton Oilers', 'NHL', 'Center', 29, 10, 68000000.00, 112000000.00, 'High', 'Generally healthy', '46 goals, 60 assists in 2024, Hart Trophy candidate', 'Michael Rosen', 'Signed'),
('Trea Turner', 'Philadelphia Phillies', 'MLB', 'Shortstop', 32, 9, 300000000.00, 0.00, 'Low', 'Hamstring strain', '.260 AVG, 21 HR, 63 RBI in 2024', 'CAA Sports', 'Under Contract');

-- ============================================================
-- 5. NEGOTIATIONS (16 entries)
-- ============================================================
INSERT INTO negotiations (player_name, team, agent_name, current_offer, asking_price, contract_years_offered, guaranteed_money_offered, status, priority, leverage_points, notes, deadline, round) VALUES
('Saquon Barkley', 'Houston Texans', 'David Mulugheta', 35000000.00, 48000000.00, 4, 28000000.00, 'In Progress', 'High', 'Coming off career year, Pro Bowl, elite rushing numbers', 'Multiple teams interested including Raiders and Chargers', '2026-03-15', 2),
('Pete Alonso', 'Toronto Blue Jays', 'Scott Boras', 21000000.00, 30000000.00, 5, 80000000.00, 'In Progress', 'Medium', 'Power hitter, consistent 30+ HR seasons', 'Team needs a first baseman badly, could go higher', '2026-04-01', 1),
('Paul George', 'Orlando Magic', 'Aaron Mintz', 30000000.00, 42000000.00, 3, 80000000.00, 'In Progress', 'Medium', 'Still elite scorer, veteran leadership', 'Magic have cap space but want shorter deal', '2026-07-10', 1),
('DeMar DeRozan', 'Miami Heat', 'Aaron Goodwin', 12000000.00, 20000000.00, 2, 20000000.00, 'In Progress', 'Low', 'Can create own shot, playoff experience', 'Heat looking for scoring punch', '2026-07-15', 1),
('Marcus Smart', 'San Antonio Spurs', 'Happy Walters', 10000000.00, 15000000.00, 3, 25000000.00, 'In Progress', 'Medium', 'DPOY, veteran mentor for Wembanyama', 'Spurs want veteran leadership', '2026-07-20', 2),
('Kirk Cousins', 'Cleveland Browns', 'Mike McCartney', 22000000.00, 35000000.00, 2, 30000000.00, 'Stalled', 'Low', 'Veteran experience, knows NFL systems', 'Achilles recovery is main concern', '2026-05-01', 3),
('Mohamed Salah', 'Liverpool', 'Ramy Abbas Issa', 35000000.00, 50000000.00, 2, 80000000.00, 'In Progress', 'High', 'Club legend, still producing at elite level', 'Fans demanding renewal, Saudi offers on table', '2026-06-30', 4),
('Blake Snell', 'New York Yankees', 'Scott Boras', 18000000.00, 28000000.00, 4, 60000000.00, 'In Progress', 'Medium', '2x Cy Young, lefty pitcher premium', 'Yankees rotation needs depth', '2026-03-20', 2),
('Christian McCaffrey', 'San Francisco 49ers', 'Creative Artists Agency', 40000000.00, 52000000.00, 4, 120000000.00, 'In Progress', 'High', 'Best all-around RB, system fit', 'Extension talks, both sides want to stay', '2026-04-15', 3),
('Vladimir Tarasenko', 'Florida Panthers', 'Craig Oster', 2000000.00, 4500000.00, 1, 2000000.00, 'In Progress', 'Low', 'Playoff experience, Stanley Cup winner', 'Panthers looking for veteran depth', '2026-07-01', 1),
('Derrick Henry', 'Pittsburgh Steelers', 'David Mulugheta', 8000000.00, 14000000.00, 2, 12000000.00, 'In Progress', 'Medium', 'Workhorse back, durability proven', 'Steelers rebuilding run game', '2026-04-01', 2),
('Patrick Mahomes', 'Kansas City Chiefs', 'Leigh Steinberg', 50000000.00, 60000000.00, 3, 180000000.00, 'In Progress', 'High', 'Best QB in football, 3x Super Bowl champ', 'Restructure to create cap space for team', '2026-07-01', 1),
('Jaylen Brown', 'Boston Celtics', 'Jason Glushon', 55000000.00, 60000000.00, 5, 280000000.00, 'Completed', 'High', 'Finals MVP, champion, supermax eligible', 'Already signed supermax extension', '2024-07-01', 5),
('Jude Bellingham', 'Real Madrid', 'Mark Rankine', 28000000.00, 35000000.00, 6, 150000000.00, 'In Progress', 'High', 'Generational talent, marketing goldmine', 'Madrid keen to lock down long-term', '2026-08-01', 2),
('Connor McDavid', 'Edmonton Oilers', 'Jeff Jackson', 16000000.00, 17000000.00, 8, 136000000.00, 'In Progress', 'High', 'Best player in hockey, Hart Trophy winner', 'Expected to become highest paid NHL player ever', '2026-07-01', 3),
('Erling Haaland', 'Manchester City', 'Rafaela Pimenta', 45000000.00, 55000000.00, 5, 200000000.00, 'In Progress', 'High', 'Record-breaking goalscorer, young and dominant', 'Release clause discussions ongoing', '2026-06-15', 2);

-- ============================================================
-- 6. PERFORMANCE (16 entries)
-- ============================================================
INSERT INTO performance (player_name, team, league, position, season, games_played, points_per_game, efficiency_rating, win_shares, all_star_selections, mvp_votes, championship_wins, market_value_impact, trend) VALUES
('Patrick Mahomes', 'Kansas City Chiefs', 'NFL', 'Quarterback', '2024-2025', 17, 0.00, 92.50, 12.40, 3, 450, 3, 50000000.00, 'Stable'),
('LeBron James', 'Los Angeles Lakers', 'NBA', 'Forward', '2024-2025', 71, 25.70, 23.50, 8.30, 20, 85, 4, 45000000.00, 'Declining'),
('Stephen Curry', 'Golden State Warriors', 'NBA', 'Guard', '2024-2025', 74, 26.40, 22.10, 9.10, 10, 120, 4, 48000000.00, 'Stable'),
('Shohei Ohtani', 'Los Angeles Dodgers', 'MLB', 'Pitcher/DH', '2024', 159, 0.00, 9.20, 8.50, 2, 380, 1, 70000000.00, 'Rising'),
('Aaron Judge', 'New York Yankees', 'MLB', 'Outfielder', '2024', 158, 0.00, 8.80, 7.60, 3, 290, 0, 42000000.00, 'Stable'),
('Connor McDavid', 'Edmonton Oilers', 'NHL', 'Center', '2024-2025', 78, 1.56, 35.20, 15.80, 5, 180, 0, 16000000.00, 'Rising'),
('Erling Haaland', 'Manchester City', 'Premier League', 'Forward', '2024-2025', 34, 1.12, 88.50, 0.00, 0, 0, 1, 55000000.00, 'Rising'),
('Kylian Mbappe', 'Real Madrid', 'La Liga', 'Forward', '2024-2025', 36, 0.83, 82.30, 0.00, 0, 0, 0, 50000000.00, 'Declining'),
('Joe Burrow', 'Cincinnati Bengals', 'NFL', 'Quarterback', '2024-2025', 16, 0.00, 96.80, 10.20, 1, 200, 0, 55000000.00, 'Rising'),
('Jaylen Brown', 'Boston Celtics', 'NBA', 'Guard/Forward', '2024-2025', 70, 23.50, 20.80, 7.40, 3, 45, 1, 50000000.00, 'Rising'),
('Mookie Betts', 'Los Angeles Dodgers', 'MLB', 'Outfielder', '2024', 116, 0.00, 7.50, 5.20, 4, 150, 1, 32000000.00, 'Declining'),
('Auston Matthews', 'Toronto Maple Leafs', 'NHL', 'Center', '2024-2025', 73, 0.75, 28.40, 11.20, 3, 120, 0, 14000000.00, 'Stable'),
('Mike Trout', 'Los Angeles Angels', 'MLB', 'Center Fielder', '2024', 29, 0.00, 4.20, 1.50, 8, 30, 0, 15000000.00, 'Declining'),
('Travis Kelce', 'Kansas City Chiefs', 'NFL', 'Tight End', '2024-2025', 17, 0.00, 78.50, 5.60, 9, 25, 3, 20000000.00, 'Declining'),
('Jude Bellingham', 'Real Madrid', 'La Liga', 'Midfielder', '2024-2025', 38, 0.58, 85.20, 0.00, 0, 0, 0, 40000000.00, 'Rising'),
('Dak Prescott', 'Dallas Cowboys', 'NFL', 'Quarterback', '2024-2025', 8, 0.00, 65.30, 3.10, 2, 30, 0, 35000000.00, 'Declining');

-- ============================================================
-- 7. DRAFT SCOUTING (16 entries)
-- ============================================================
INSERT INTO draft_scouting (prospect_name, college, league, position, age, height, weight, projected_pick, projected_round, grade, strengths, weaknesses, comparison_player, projected_contract_value, draft_year, status) VALUES
('Cam Ward', 'Miami (FL)', 'NFL', 'Quarterback', 22, '6''2"', 223, 1, 1, 95.50, 'Elite arm talent, pocket mobility, clutch performer, high football IQ', 'Occasional turnover issues, needs to improve footwork', 'Patrick Mahomes', 40000000.00, 2025, 'Eligible'),
('Shedeur Sanders', 'Colorado', 'NFL', 'Quarterback', 22, '6''2"', 215, 2, 1, 93.00, 'Accurate passer, quick release, composure under pressure, leadership', 'Average arm strength, limited rushing ability', 'Dak Prescott', 38000000.00, 2025, 'Eligible'),
('Travis Hunter', 'Colorado', 'NFL', 'CB/WR', 21, '6''1"', 185, 3, 1, 97.00, 'Two-way player, elite ball skills, shutdown corner, dynamic receiver', 'Durability concerns playing both ways, lean frame', 'Champ Bailey', 36000000.00, 2025, 'Eligible'),
('Abdul Carter', 'Penn State', 'NFL', 'Edge', 20, '6''3"', 252, 4, 1, 94.00, 'Explosive first step, bend around edge, versatile pass rusher', 'Run defense needs improvement, limited pass rush moves', 'Micah Parsons', 34000000.00, 2025, 'Eligible'),
('Cooper Flagg', 'Duke', 'NBA', 'Forward', 18, '6''9"', 205, 1, 1, 98.00, 'Elite two-way player, high motor, basketball IQ, versatile scorer', 'Needs to add muscle, three-point shot inconsistent', 'Jayson Tatum', 50000000.00, 2025, 'Eligible'),
('Dylan Harper', 'Rutgers', 'NBA', 'Guard', 19, '6''6"', 210, 2, 1, 92.00, 'Scoring ability, playmaking, smooth jumper, NBA-ready body', 'Defensive effort inconsistent, turnover prone', 'Donovan Mitchell', 42000000.00, 2025, 'Eligible'),
('Ace Bailey', 'Rutgers', 'NBA', 'Forward', 19, '6''9"', 195, 3, 1, 91.50, 'Elite shot-making, smooth offensive game, versatile scorer', 'Thin frame, defensive awareness needs work', 'Kevin Durant', 40000000.00, 2025, 'Eligible'),
('VJ Edgecombe', 'Baylor', 'NBA', 'Guard', 19, '6''5"', 185, 5, 1, 89.00, 'Explosive athleticism, transition player, competitive fire', 'Jump shot mechanics, decision making', 'Anthony Edwards', 30000000.00, 2025, 'Eligible'),
('Tetairoa McMillan', 'Arizona', 'NFL', 'Wide Receiver', 21, '6''5"', 212, 8, 1, 92.50, 'Contested catch ability, body control, route running, size', 'Could improve release off the line, average YAC', 'Mike Evans', 28000000.00, 2025, 'Eligible'),
('Mason Lowe', 'Florida State', 'NFL', 'Offensive Tackle', 22, '6''6"', 315, 10, 1, 90.00, 'Elite pass protection, quick feet, long arms, anchor strength', 'Run blocking technique needs refinement', 'Trent Williams', 25000000.00, 2025, 'Eligible'),
('Jaxon Dart', 'Ole Miss', 'NFL', 'Quarterback', 22, '6''2"', 225, 15, 1, 87.50, 'Strong arm, competitive, mobile, high-volume passer', 'Reads can be slow, accuracy under pressure', 'Baker Mayfield', 22000000.00, 2025, 'Eligible'),
('Roki Sasaki', 'Japan (NPB)', 'MLB', 'Pitcher', 23, '6''4"', 205, 0, 0, 96.00, '102 mph fastball, devastating splitter, elite strikeout rate', 'Injury history, workload management needed', 'Shohei Ohtani (pitching)', 15000000.00, 2025, 'Posted'),
('Charlie Condon', 'Georgia', 'MLB', 'First Base/OF', 21, '6''6"', 210, 1, 1, 90.00, 'Elite power, plate discipline, opposite-field ability', 'Defensive position uncertain, strikeout rate', 'Pete Alonso', 9000000.00, 2025, 'Eligible'),
('Jalen Milroe', 'Alabama', 'NFL', 'Quarterback', 22, '6''2"', 225, 20, 1, 85.00, 'Dual-threat ability, elite rushing, strong arm, playmaker', 'Inconsistent accuracy, processing speed', 'Lamar Jackson', 20000000.00, 2025, 'Eligible'),
('Malaki Starks', 'Georgia', 'NFL', 'Safety', 21, '6''1"', 205, 12, 1, 91.00, 'Instincts, range, tackling, ball-hawk ability, leadership', 'Average size for position, can get caught in traffic', 'Tyrann Mathieu', 22000000.00, 2025, 'Eligible'),
('Kelvin Banks Jr.', 'Texas', 'NFL', 'Offensive Tackle', 21, '6''4"', 320, 14, 1, 89.50, 'Technique, footwork, consistency, pass blocking', 'Arm length concerns, needs to improve power at point of attack', 'Tyron Smith', 24000000.00, 2025, 'Eligible');

-- ============================================================
-- 8. INJURY REPORTS (16 entries)
-- ============================================================
INSERT INTO injury_reports (player_name, team, league, position, injury_type, body_part, severity, injury_date, expected_return, games_missed, contract_impact, insurance_coverage, rehabilitation_status, notes, status) VALUES
('Dak Prescott', 'Dallas Cowboys', 'NFL', 'Quarterback', 'Hamstring Tear', 'Hamstring', 'Severe', '2024-09-22', '2025-09-01', 14, 60000000.00, true, 'Rehab Phase 3', 'Season-ending injury, expected full recovery for 2025', 'Recovering'),
('Jonathan Taylor', 'Indianapolis Colts', 'NFL', 'Running Back', 'High Ankle Sprain', 'Ankle', 'Moderate', '2025-01-15', '2025-03-15', 4, 5000000.00, false, 'Rehab Phase 2', 'Recurring ankle issues, monitoring closely', 'Active'),
('Kawhi Leonard', 'Los Angeles Clippers', 'NBA', 'Forward', 'Knee Inflammation', 'Knee', 'Chronic', '2024-11-01', '2025-04-01', 35, 48000000.00, true, 'Load Management', 'Chronic knee issue, career longevity concern', 'Active'),
('Mike Trout', 'Los Angeles Angels', 'MLB', 'Center Fielder', 'Meniscus Tear', 'Knee', 'Severe', '2024-04-29', '2025-04-01', 130, 35541667.00, true, 'Post-Surgery', 'Second major knee surgery, age 32 recovery concerns', 'Recovering'),
('Ja Morant', 'Memphis Grizzlies', 'NBA', 'Guard', 'Shoulder Labral Tear', 'Shoulder', 'Severe', '2024-01-05', '2024-10-15', 50, 34000000.00, true, 'Cleared', 'Returned to full activity, monitoring workload', 'Resolved'),
('Christian McCaffrey', 'San Francisco 49ers', 'NFL', 'Running Back', 'Achilles Tendinitis', 'Achilles', 'Moderate', '2024-09-01', '2025-03-01', 16, 16000000.00, false, 'Rehab Phase 3', 'Bilateral Achilles issues, missed entire 2024 season', 'Recovering'),
('Chet Holmgren', 'Oklahoma City Thunder', 'NBA', 'Center', 'Hip Injury', 'Hip', 'Moderate', '2025-01-10', '2025-03-20', 15, 12000000.00, false, 'Rehab Phase 2', 'Recurring hip issues, concerning for long-term durability', 'Active'),
('Tua Tagovailoa', 'Miami Dolphins', 'NFL', 'Quarterback', 'Concussion', 'Head', 'Severe', '2024-09-12', '2024-12-01', 7, 53100000.00, true, 'Protocol Cleared', 'Third documented concussion, career longevity concerns', 'Resolved'),
('Ronald Acuna Jr.', 'Atlanta Braves', 'MLB', 'Outfielder', 'ACL Tear', 'Knee', 'Severe', '2024-05-26', '2025-06-01', 100, 17000000.00, true, 'Rehab Phase 2', 'Second ACL tear, lengthy rehabilitation expected', 'Recovering'),
('Erling Haaland', 'Manchester City', 'Premier League', 'Forward', 'Groin Strain', 'Groin', 'Minor', '2025-02-10', '2025-03-01', 3, 0.00, false, 'Light Training', 'Minor strain, precautionary rest', 'Active'),
('Connor McDavid', 'Edmonton Oilers', 'NHL', 'Center', 'Ankle Sprain', 'Ankle', 'Minor', '2025-02-20', '2025-03-05', 4, 0.00, false, 'Day-to-Day', 'Minor ankle tweak, expected quick return', 'Active'),
('Tyreek Hill', 'Miami Dolphins', 'NFL', 'Wide Receiver', 'Knee Sprain', 'Knee', 'Moderate', '2024-12-15', '2025-06-01', 3, 30000000.00, false, 'Off-Season Rehab', 'MCL sprain, should be ready for training camp', 'Recovering'),
('Luka Doncic', 'Dallas Mavericks', 'NBA', 'Guard', 'Calf Strain', 'Calf', 'Moderate', '2025-01-20', '2025-03-15', 20, 40000000.00, false, 'Rehab Phase 2', 'Recurring calf issues, conditioning program adjusted', 'Active'),
('Spencer Strider', 'Atlanta Braves', 'MLB', 'Pitcher', 'UCL Tear (Tommy John)', 'Elbow', 'Severe', '2024-04-15', '2025-08-01', 162, 10000000.00, true, 'Post-Surgery', 'Tommy John surgery, typical 12-18 month recovery', 'Recovering'),
('Saquon Barkley', 'Philadelphia Eagles', 'NFL', 'Running Back', 'Ankle Sprain', 'Ankle', 'Minor', '2025-01-19', '2025-02-05', 0, 0.00, false, 'Cleared', 'Minor playoff game tweak, played through it', 'Resolved'),
('Neymar Jr.', 'Al Hilal', 'Saudi Pro League', 'Forward', 'ACL Tear', 'Knee', 'Severe', '2023-10-17', '2025-01-15', 60, 80000000.00, true, 'Return to Play', 'Returned but re-injured hamstring, career trajectory uncertain', 'Active');

-- ============================================================
-- 9. TEAM ROSTERS (16 entries)
-- ============================================================
INSERT INTO team_rosters (team, league, player_name, position, jersey_number, age, contract_status, annual_salary, years_remaining, role, performance_grade, trade_eligible, notes) VALUES
('Kansas City Chiefs', 'NFL', 'Patrick Mahomes', 'Quarterback', 15, 29, 'Under Contract', 45000000.00, 6, 'Franchise Player', 'A+', false, 'Face of franchise, untouchable asset'),
('Kansas City Chiefs', 'NFL', 'Travis Kelce', 'Tight End', 87, 35, 'Under Contract', 17125000.00, 1, 'Core Player', 'A', false, 'Potential final season, still productive'),
('Kansas City Chiefs', 'NFL', 'Chris Jones', 'Defensive Tackle', 95, 30, 'Under Contract', 31750000.00, 3, 'Core Player', 'A+', false, 'Elite interior defender'),
('Los Angeles Lakers', 'NBA', 'LeBron James', 'Forward', 23, 40, 'Under Contract', 52150000.00, 1, 'Franchise Player', 'A', false, 'Potential final season, still All-Star caliber'),
('Los Angeles Lakers', 'NBA', 'Anthony Davis', 'Center/Forward', 3, 32, 'Under Contract', 43219440.00, 2, 'Core Player', 'A', false, 'Injury history but elite when healthy'),
('Los Angeles Lakers', 'NBA', 'Austin Reaves', 'Guard', 15, 27, 'Under Contract', 12000000.00, 3, 'Starter', 'B+', true, 'Emerging star, great value contract'),
('New York Yankees', 'MLB', 'Aaron Judge', 'Outfielder', 99, 32, 'Under Contract', 40000000.00, 6, 'Franchise Player', 'A', false, 'Team captain, clubhouse leader'),
('New York Yankees', 'MLB', 'Juan Soto', 'Outfielder', 22, 26, 'Under Contract', 51000000.00, 14, 'Franchise Player', 'A+', false, 'Generational hitter, long-term anchor'),
('New York Yankees', 'MLB', 'Gerrit Cole', 'Pitcher', 45, 34, 'Under Contract', 36000000.00, 4, 'Ace', 'A', false, 'Cy Young caliber when healthy'),
('Real Madrid', 'La Liga', 'Kylian Mbappe', 'Forward', 9, 26, 'Under Contract', 50000000.00, 4, 'Franchise Player', 'A', false, 'Marquee signing, face of the club'),
('Real Madrid', 'La Liga', 'Jude Bellingham', 'Midfielder', 5, 21, 'Under Contract', 25000000.00, 4, 'Core Player', 'A+', false, 'Generational talent, locked up long-term'),
('Real Madrid', 'La Liga', 'Vinicius Jr.', 'Forward', 7, 24, 'Under Contract', 35000000.00, 3, 'Core Player', 'A', false, 'Ballon d''Or candidate, explosive winger'),
('Edmonton Oilers', 'NHL', 'Connor McDavid', 'Center', 97, 28, 'Under Contract', 12500000.00, 1, 'Franchise Player', 'A+', false, 'Best player in hockey, extension talks ongoing'),
('Edmonton Oilers', 'NHL', 'Leon Draisaitl', 'Center', 29, 29, 'Under Contract', 14000000.00, 7, 'Core Player', 'A+', false, 'New mega extension, elite scorer'),
('Boston Celtics', 'NBA', 'Jayson Tatum', 'Forward', 0, 27, 'Under Contract', 54000000.00, 4, 'Franchise Player', 'A', false, 'Champion, supermax contract'),
('Boston Celtics', 'NBA', 'Jaylen Brown', 'Guard/Forward', 7, 28, 'Under Contract', 50610000.00, 4, 'Core Player', 'A', false, 'Finals MVP, championship duo');

-- ============================================================
-- 10. TRADE ANALYSIS (16 entries)
-- ============================================================
INSERT INTO trade_analysis (trade_title, team_a, team_b, league, players_from_a, players_from_b, picks_from_a, picks_from_b, salary_impact_a, salary_impact_b, trade_grade_a, trade_grade_b, rationale, status, trade_date) VALUES
('Jimmy Butler to Mavericks', 'Miami Heat', 'Dallas Mavericks', 'NBA', 'Jimmy Butler ($48.8M)', 'P.J. Washington ($22.5M), Tim Hardaway Jr. ($16.1M)', '2027 2nd Round', '2026 1st Round, 2028 1st Round', -10200000.00, 10200000.00, 'B+', 'A-', 'Heat clear cap space for 2025 FA class; Mavs add championship-caliber second star alongside Luka', 'Proposed', '2025-02-01'),
('De''Aaron Fox to Spurs', 'Sacramento Kings', 'San Antonio Spurs', 'NBA', 'De''Aaron Fox ($34.8M)', 'Keldon Johnson ($20M), Devin Vassell ($12M)', '2027 1st Round', '2025 1st Round, 2027 1st Round, 2029 1st Round', -2800000.00, 2800000.00, 'B', 'A', 'Kings pivot to rebuild; Spurs pair Fox with Wembanyama for elite PG-big man combo', 'Proposed', '2025-02-04'),
('Davante Adams to Jets', 'Las Vegas Raiders', 'New York Jets', 'NFL', 'Davante Adams ($35.6M)', 'Conditional picks package', '—', '2025 2nd Round, 2026 3rd Round', -35600000.00, 35600000.00, 'B+', 'B', 'Raiders rebuild and shed salary; Jets reunite Adams with Aaron Rodgers', 'Completed', '2024-10-15'),
('Soto to Yankees Mega-Deal', 'San Diego Padres', 'New York Yankees', 'MLB', 'Juan Soto', 'Multiple top prospects', '—', '5 top-100 prospects', 0.00, 51000000.00, 'B-', 'A+', 'Padres shed payroll and restock farm; Yankees land generational bat to pair with Judge', 'Completed', '2023-12-07'),
('Mikael Granlund Package', 'San Jose Sharks', 'Dallas Stars', 'NHL', 'Mikael Granlund ($5M)', 'Prospect + pick', '—', '2025 2nd Round, B-prospect', -5000000.00, 5000000.00, 'B', 'B+', 'Sharks get assets for rental; Stars add scoring depth for playoff push', 'Proposed', '2025-03-01'),
('Brandon Aiyuk Extension Fallout', 'San Francisco 49ers', 'Pittsburgh Steelers', 'NFL', 'Brandon Aiyuk ($30M/yr)', 'Picks package', '—', '2025 1st, 2026 2nd', -30000000.00, 30000000.00, 'B-', 'B+', 'Trade that almost happened - 49ers kept Aiyuk but considered moving him over contract demands', 'Rejected', '2024-08-10'),
('Lauri Markkanen to Warriors', 'Utah Jazz', 'Golden State Warriors', 'NBA', 'Lauri Markkanen ($18M)', 'Andrew Wiggins ($24.7M), Brandin Podziemski', '2027 2nd Round', '2026 1st Round, 2028 1st Round', 6700000.00, -6700000.00, 'A-', 'B+', 'Jazz acquire picks and young talent; Warriors get All-Star level player to pair with Curry', 'Proposed', '2025-02-01'),
('Robert Lewandowski for Cash', 'Barcelona', 'Inter Miami', 'La Liga', 'Robert Lewandowski ($15M)', 'Cash + allocation money', '—', '$8M transfer fee', -15000000.00, 15000000.00, 'B+', 'B', 'Barcelona reduce wage bill; Inter Miami add star power alongside Messi', 'Proposed', '2025-07-01'),
('Mitch Marner Trade Options', 'Toronto Maple Leafs', 'Multiple Teams', 'NHL', 'Mitch Marner ($10.9M)', 'Varies by destination', '—', '1st Round + prospect', -10900000.00, 10900000.00, 'B', 'A-', 'Leafs looking to shake up core after playoff failures; Marner has NMC', 'Proposed', '2025-03-15'),
('Deebo Samuel to Chiefs', 'San Francisco 49ers', 'Kansas City Chiefs', 'NFL', 'Deebo Samuel ($23.9M)', 'Picks + player', 'Conditional 7th', '2025 2nd Round, 2026 3rd Round', -23900000.00, 23900000.00, 'B', 'A', '49ers reshape offense; Chiefs add dynamic playmaker for Mahomes', 'Proposed', '2025-03-10'),
('Pascal Siakam Extension Trade', 'Toronto Raptors', 'Indiana Pacers', 'NBA', 'Pascal Siakam ($37.9M)', 'Bruce Brown, Jordan Nwora', '—', '2024 1st Round', -37900000.00, 37900000.00, 'B+', 'A', 'Raptors commit to rebuild; Pacers add All-Star caliber frontcourt player', 'Completed', '2024-01-15'),
('Eloy Jimenez Salary Dump', 'Chicago White Sox', 'Baltimore Orioles', 'MLB', 'Eloy Jimenez ($13M)', 'Cash considerations', '—', '—', -13000000.00, 13000000.00, 'C+', 'B+', 'White Sox full teardown mode; Orioles take flier on talent with injury risk', 'Completed', '2024-03-20'),
('Chris Paul to Spurs', 'Golden State Warriors', 'San Antonio Spurs', 'NBA', 'Chris Paul ($30M)', 'Waived', '—', '—', -30000000.00, 30000000.00, 'B+', 'A-', 'Warriors clear cap space; Spurs get veteran mentor for Wembanyama', 'Completed', '2024-07-01'),
('Caleb Williams Draft Rights', 'Chicago Bears', 'Washington Commanders', 'NFL', 'Caleb Williams (drafted)', 'Jayden Daniels (drafted)', '—', '—', 0.00, 0.00, 'A', 'A+', 'Hypothetical: What if teams swapped #1/#2 picks - both QBs excelled', 'Hypothetical', '2024-04-25'),
('Kylian Mbappe Free Transfer', 'Paris Saint-Germain', 'Real Madrid', 'La Liga', 'Kylian Mbappe (free)', 'None (free transfer)', '—', 'Signing bonus ~$150M', 0.00, -100000000.00, 'D', 'A+', 'PSG lost asset for nothing; Madrid land generational talent at zero transfer fee', 'Completed', '2024-07-01'),
('Three-Team NBA Blockbuster', 'Portland Trail Blazers', 'Phoenix Suns', 'NBA', 'Draft picks, salary filler', 'Bradley Beal rerouted', '2025 1st, 2027 1st', 'Salary relief', 15000000.00, -15000000.00, 'A-', 'B', 'Blazers acquire picks; Suns shed Beal salary for flexibility', 'Proposed', '2025-02-06');

-- ============================================================
-- 11. CLIENTS (10 entries)
-- ============================================================
INSERT INTO clients (player_name, sport, league, position, age, phone, email, representation_start, contract_status, current_team, current_salary, commission_rate, notes, status) VALUES
('Patrick Mahomes', 'Football', 'NFL', 'QB', 29, '555-0101', 'pmahomes@email.com', '2017-04-27', 'Active', 'Kansas City Chiefs', 45000000.00, 3.00, 'Flagship client. Multiple endorsement deals.', 'Active'),
('LeBron James', 'Basketball', 'NBA', 'SF', 41, '555-0102', 'ljames@email.com', '2003-06-26', 'Active', 'Los Angeles Lakers', 52150000.00, 4.00, 'Lifetime Nike deal. Media empire.', 'Active'),
('Shohei Ohtani', 'Baseball', 'MLB', 'SP', 31, '555-0103', 'sohtani@email.com', '2023-12-01', 'Active', 'Los Angeles Dodgers', 70000000.00, 5.00, 'Deferred salary structure. Massive global brand.', 'Active'),
('Connor McDavid', 'Hockey', 'NHL', 'C', 28, '555-0104', 'cmcdavid@email.com', '2015-06-26', 'Expiring', 'Edmonton Oilers', 12500000.00, 4.00, 'Contract expiring 2026. Extension talks pending.', 'Active'),
('Erling Haaland', 'Soccer', 'Premier League', 'FWD', 25, '555-0105', 'ehaaland@email.com', '2022-06-13', 'Active', 'Manchester City', 40000000.00, 5.00, 'Release clause considerations. Top global brand.', 'Active'),
('Jaylen Brown', 'Basketball', 'NBA', 'SG', 28, '555-0106', 'jbrown@email.com', '2017-06-22', 'Active', 'Boston Celtics', 50610000.00, 4.00, 'Largest NBA contract in history at signing.', 'Active'),
('Joe Burrow', 'Football', 'NFL', 'QB', 28, '555-0107', 'jburrow@email.com', '2020-04-23', 'Active', 'Cincinnati Bengals', 55000000.00, 3.50, 'Injury history noted. Top-tier talent.', 'Active'),
('Mookie Betts', 'Baseball', 'MLB', 'OF', 32, '555-0108', 'mbetts@email.com', '2020-02-10', 'Active', 'Los Angeles Dodgers', 30416667.00, 4.00, 'Multi-sport athlete potential. Community leader.', 'Active'),
('Auston Matthews', 'Hockey', 'NHL', 'C', 27, '555-0109', 'amatthews@email.com', '2016-06-24', 'Active', 'Toronto Maple Leafs', 13250000.00, 4.00, 'American-born star in Canadian market.', 'Active'),
('Jude Bellingham', 'Soccer', 'Premier League', 'MID', 22, '555-0110', 'jbellingham@email.com', '2023-06-14', 'Active', 'Real Madrid', 25000000.00, 5.00, 'Young talent. Huge upside in endorsements.', 'Prospect');

-- ============================================================
-- 12. FINANCIALS (12 entries)
-- ============================================================
INSERT INTO financials (transaction_type, description, player_name, deal_name, amount, commission_earned, expense_category, payment_status, payment_date, due_date, notes) VALUES
('Commission', 'Mahomes contract extension commission', 'Patrick Mahomes', 'Chiefs 10-year extension', 450000000.00, 13500000.00, NULL, 'Paid', '2020-07-10', '2020-07-10', 'Paid upon signing'),
('Commission', 'LeBron Lakers deal commission', 'LeBron James', 'Lakers 2-year deal', 104300000.00, 4172000.00, NULL, 'Paid', '2024-07-05', '2024-07-05', 'Standard 4% rate'),
('Commission', 'Ohtani Dodgers deal commission', 'Shohei Ohtani', 'Dodgers 10-year deal', 700000000.00, 35000000.00, NULL, 'Pending', NULL, '2025-02-01', 'Deferred payment structure - commission on signing bonus'),
('Commission', 'Burrow extension commission', 'Joe Burrow', 'Bengals 5-year extension', 275000000.00, 9625000.00, NULL, 'Paid', '2023-09-05', '2023-09-05', 'Paid at signing'),
('Expense', 'Travel - NFL Combine scouting trip', NULL, NULL, 8500.00, 0.00, 'Travel', 'Paid', '2025-02-25', '2025-02-25', 'Indianapolis - hotel, flights, meals'),
('Expense', 'Legal fees - CBA consultation', NULL, NULL, 25000.00, 0.00, 'Legal', 'Paid', '2025-01-15', '2025-01-15', 'Outside counsel for CBA interpretation'),
('Commission', 'Haaland Nike endorsement commission', 'Erling Haaland', 'Nike global deal', 20000000.00, 1000000.00, NULL, 'Paid', '2023-08-01', '2023-08-01', '5% endorsement commission'),
('Expense', 'Marketing - client branding campaign', 'Jude Bellingham', NULL, 45000.00, 0.00, 'Marketing', 'Paid', '2024-11-01', '2024-11-01', 'Social media and PR campaign'),
('Commission', 'Brown supermax commission', 'Jaylen Brown', 'Celtics supermax', 303660000.00, 12146400.00, NULL, 'Pending', NULL, '2025-07-01', 'Payment scheduled after first year'),
('Retainer', 'Monthly retainer - Q1 2025', NULL, NULL, 50000.00, 0.00, NULL, 'Paid', '2025-01-01', '2025-01-01', 'Office operations retainer'),
('Expense', 'Entertainment - client dinner', 'Connor McDavid', NULL, 3200.00, 0.00, 'Entertainment', 'Paid', '2025-02-14', '2025-02-14', 'Extension negotiation dinner'),
('Bonus', 'Performance bonus - Mahomes MVP', 'Patrick Mahomes', 'MVP bonus clause', 5000000.00, 150000.00, NULL, 'Pending', NULL, '2025-06-01', 'Triggered by MVP award');

-- ============================================================
-- 13. LEAGUE RULES (10 entries)
-- ============================================================
INSERT INTO league_rules (league, rule_category, rule_name, description, salary_cap_amount, luxury_tax_threshold, roster_limit, min_salary, max_contract_years, free_agency_start, trade_deadline, season, status) VALUES
('NFL', 'Salary Cap', 'NFL Salary Cap 2025', 'Hard salary cap with no luxury tax. Teams cannot exceed the cap.', 255400000.00, NULL, 53, 795000.00, 5, 'March (League Year Start)', 'November Trade Deadline', '2025', 'Current'),
('NBA', 'Salary Cap', 'NBA Salary Cap 2024-25', 'Soft cap with luxury tax. Teams can exceed via Bird rights and exceptions.', 140588000.00, 170814000.00, 15, 1119563.00, 5, 'June 30 (Free Agency)', 'February Trade Deadline', '2024-25', 'Current'),
('MLB', 'Salary Cap', 'MLB Competitive Balance Tax', 'No hard cap. Luxury tax (CBT) threshold penalizes high payrolls.', NULL, 241000000.00, 26, 740000.00, NULL, 'Day after World Series', 'July 31 Trade Deadline', '2025', 'Current'),
('NHL', 'Salary Cap', 'NHL Salary Cap 2024-25', 'Hard salary cap with floor. Teams must spend at minimum floor.', 88000000.00, NULL, 23, 775000.00, 8, 'July 1 (Free Agency)', 'March Trade Deadline', '2024-25', 'Current'),
('NFL', 'Free Agency', 'NFL Free Agency Rules', 'Unrestricted free agents after 4 accrued seasons. Franchise tag available.', NULL, NULL, NULL, NULL, NULL, 'March (Legal Tampering 2 days before)', NULL, '2025', 'Current'),
('NBA', 'Contract', 'NBA Max Contract Rules', 'Max salary based on years of service: 25%/30%/35% of cap. Supermax at 35%.', NULL, NULL, NULL, NULL, 5, NULL, NULL, '2024-25', 'Current'),
('NFL', 'Draft', 'NFL Rookie Wage Scale', 'Draft picks signed to 4-year deals with 5th-year option for 1st rounders. Slotted values based on pick number.', NULL, NULL, NULL, NULL, 4, NULL, NULL, '2025', 'Current'),
('NBA', 'Trade', 'NBA Trade Rules', 'Salary matching required within 125% + $100K for teams over cap. Below cap teams can absorb into cap space.', NULL, NULL, NULL, NULL, NULL, NULL, 'February Trade Deadline', '2024-25', 'Current'),
('MLS', 'Salary Cap', 'MLS Salary Budget 2025', 'Salary budget with Designated Player rule (max 3 DPs exempt from cap).', 5470000.00, NULL, 30, 65500.00, 5, 'January (Transfer Window)', 'August Secondary Window', '2025', 'Current'),
('Premier League', 'Revenue Sharing', 'Premier League Financial Fair Play', 'Profitability and Sustainability Rules. Clubs limited to losses of £105M over 3 years.', NULL, NULL, 25, NULL, NULL, 'July 1 (Transfer Window)', 'January 31 Window Close', '2024-25', 'Current');
