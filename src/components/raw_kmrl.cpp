#include <iostream>

#include <vector>

#include <string>

#include <algorithm>

#include <cmath>

using namespace std;



// ---------------------- Constants ----------------------

const double W_FITNESS   = 0.25;

const double W_JOBCARDS  = 0.2;

const double W_BRANDING  = 0.2;

const double W_MILEAGE   = 0.2;

const double W_CLEANING  = 0.15;

const int MAX_JOB_CARDS  = 10;

const int MAX_CARS       = 4;  // per trainset



// ---------------------- JobCard Class ----------------------

class JobCard {

public:

    int job_id;

    string belongs_to;

    string severity; // "minor", "moderate", "critical"



    JobCard(int _job_id, string _belongs_to, string _severity)

        : job_id(_job_id), belongs_to(_belongs_to), severity(_severity) {}

};



// ---------------------- Branding Class ----------------------

class Branding {

public:

    string brandName;

    int duration;   // months

    double amount;  // contract value



    Branding(string b, int d, double a)

        : brandName(b), duration(d), amount(a) {}

};



// ---------------------- Trainset Class ----------------------

class Trainset {

public:

    string id;

    bool fitnessOK;

    vector<JobCard> jobCardsLeft;

    double mileage;

    bool cleaned;   // 1 = cleaned, 0 = not cleaned

    bool inducted = false;



    vector<Branding> brandings;



    // Scores

    double fitnessScore = 0.0;

    double jobCardScore = 0.0;

    double brandingPriorityScore = 0.0;

    double mileageScore = 0.0;

    double cleaningScore = 0.0; // default 0.0

    double finalTotalScore = 0.0;



    Trainset(string _id, bool _fitnessOK, vector<JobCard> _jobCardsLeft,

             double _mileage, bool _cleaned)

        : id(_id), fitnessOK(_fitnessOK), jobCardsLeft(_jobCardsLeft),

          mileage(_mileage), cleaned(_cleaned) {}



    // ---------------- JobCard Score ----------------

    double computeJobCardScore() const {

        double totalPenalty = 0.0;

        for (auto& jc : jobCardsLeft) {

            if (jc.severity == "critical") totalPenalty += 1.0;

            else if (jc.severity == "moderate") totalPenalty += 0.6;

            else if (jc.severity == "minor") totalPenalty += 0.3;

        }

        // Normalize penalty by max possible penalty

        double maxPenalty = 1.0 * MAX_JOB_CARDS;

        return max(0.0, 1.0 - totalPenalty / maxPenalty);

    }



    // ---------------- Branding Score ----------------

    double getTotalBrandingAmount() const {

        double sum = 0.0;

        for (auto &b : brandings) sum += b.amount;

        return sum;

    }



    double computeBrandingScore() {

        // Normalize amount and count independently for better weighting

        double amountFactor = min(1.0, getTotalBrandingAmount() / 2000000.0); // 2 million assumed max value

        double countFactor  = min(1.0, (double)brandings.size() / MAX_CARS);

        brandingPriorityScore = (amountFactor * 0.7) + (countFactor * 0.3);

        return brandingPriorityScore;

    }



    bool addBranding(const Branding &b) {

        if (brandings.size() < MAX_CARS) {

            brandings.push_back(b);

            return true;

        }

        cout << "❌ No space left for branding in Trainset " << id << endl;

        return false;

    }



    // ---------------- Cleaning Score ----------------

    double computeCleaningScore() {

        cleaningScore = cleaned ? 1.0 : 0.0;

        return cleaningScore;

    }

};



// ---------------------- TrainsetManager Class ----------------------

class TrainsetManager {

private:

    vector<Trainset> trainsets;

    double avgMileage = 0.0;

    double maxMileage = 0.0;



public:

    TrainsetManager(const vector<Trainset>& _trainsets) : trainsets(_trainsets) {}



    void verifyFitness() {

        cout << "🔍 Fitness Certificate Check:\n";

        for (auto& t : trainsets) {

            if (!t.fitnessOK) {

                cout << "❌ Trainset " << t.id << " denied induction: Invalid fitness certificate.\n";

                t.inducted = false;

            } else {

                cout << "✅ Trainset " << t.id << " passed fitness check.\n";

                t.inducted = true;

            }

        }

        cout << endl;

    }



    void calculateJobCardScore() {

        cout << "🔍 JobCards Score Calculation:\n";

        for (auto& t : trainsets) {

            if (!t.inducted) continue;

            t.jobCardScore = t.computeJobCardScore();

            cout << "Trainset " << t.id

                 << " | JobCards: " << t.jobCardsLeft.size()

                 << " | Score: " << t.jobCardScore << endl;

        }

        cout << endl;

    }





    void computeMileageBase() {

        double sum = 0.0;

        maxMileage = 0.0;

        for (auto& t : trainsets) {

            sum += t.mileage;

            maxMileage = max(maxMileage, t.mileage);

        }

        avgMileage = (trainsets.empty() ? 0.0 : sum / trainsets.size());



        cout << "🚆 Average Fleet Mileage: " << avgMileage << endl;

        cout << "🏁 Max Mileage in Fleet: " << maxMileage << endl << endl;

    }



    void computeMileageScore() {

        cout << "🔹 Mileage Score Calculation:\n";

        for (auto& t : trainsets) {

            if (!t.inducted) continue;



            if (maxMileage > 0) {

                t.mileageScore = 1.0 - (t.mileage / maxMileage);

            } else {

                t.mileageScore = 1.0;

            }

            t.mileageScore = max(0.0, min(1.0, t.mileageScore));

            cout << "Trainset " << t.id << " → Mileage Score: " << t.mileageScore << endl;

        }

        cout << endl;

    }



    void computeCleaningScore() {

        cout << "🧼 Cleaning Score Calculation:\n";

        for (auto& t : trainsets) {

            if (!t.inducted) continue;

            t.cleaningScore = t.computeCleaningScore();

            cout << "Trainset " << t.id << " → Cleaning Score: " << t.cleaningScore << endl;

        }

        cout << endl;

    }



    void computeScores() {

        for (auto& t : trainsets) {

            if (!t.inducted) continue;



            t.fitnessScore = t.fitnessOK ? 1.0 : 0.0;

            t.jobCardScore = t.computeJobCardScore();

            t.brandingPriorityScore = t.computeBrandingScore();

            t.computeCleaningScore();



            // Final total score

            t.finalTotalScore = W_FITNESS  * t.fitnessScore

                               + W_JOBCARDS * t.jobCardScore

                               + W_BRANDING * t.brandingPriorityScore

                               + W_MILEAGE  * t.mileageScore

                               + W_CLEANING * t.cleaningScore;

        }

    }



    void printInductionList() const {

        // Collect inducted trainsets

        vector<Trainset> inductedTrainsets;

        for (const auto& t : trainsets) {

            if (t.inducted) inductedTrainsets.push_back(t);

        }



        // Sort by finalTotalScore descending

        sort(inductedTrainsets.begin(), inductedTrainsets.end(),

             [](const Trainset &a, const Trainset &b) {

                 return a.finalTotalScore > b.finalTotalScore;

             });



        // Print sorted list

        cout << "📋 Final Induction List (Sorted by Total Score):\n";

        for (const auto& t : inductedTrainsets) {

            cout << "✅ " << t.id

                 << " || Final Total Score: " << t.finalTotalScore

                 << endl;

        }

        cout << endl;

    }

};



// ---------------------- Main Function ----------------------

int main() {

    vector<Trainset> trainsets = {

        // Original 6 Trainsets

        Trainset("TS01", true, {JobCard(1, "TS01", "minor"), JobCard(2, "TS01", "moderate")}, 2500, true),

        Trainset("TS02", true, {JobCard(3, "TS02", "critical")}, 6000, false),

        Trainset("TS03", false, {}, 3500, true),

        Trainset("TS04", true, {JobCard(4, "TS04", "moderate"), JobCard(5, "TS04", "minor")}, 4500, false),

        Trainset("TS05", true, {JobCard(6, "TS05", "critical"), JobCard(7, "TS05", "moderate")}, 7000, true),

        Trainset("TS06", true, {}, 3000, true),



        // Added 25 New Trainsets

        Trainset("TS07", true, {JobCard(8, "TS07", "minor")}, 1500, true),

        Trainset("TS08", true, {JobCard(9, "TS08", "critical")}, 8500, false),

        Trainset("TS09", false, {JobCard(10, "TS09", "moderate")}, 4000, true),

        Trainset("TS10", true, {}, 900, true),

        Trainset("TS11", true, {JobCard(11, "TS11", "moderate"), JobCard(12, "TS11", "moderate")}, 5500, false),

        Trainset("TS12", true, {JobCard(13, "TS12", "critical"), JobCard(14, "TS12", "critical")}, 9500, false),

        Trainset("TS13", true, {JobCard(15, "TS13", "minor"), JobCard(16, "TS13", "minor")}, 2000, true),

        Trainset("TS14", true, {JobCard(17, "TS14", "critical"), JobCard(18, "TS14", "moderate"), JobCard(19, "TS14", "minor")}, 6500, false),

        Trainset("TS15", true, {}, 1000, true),

        Trainset("TS16", false, {}, 5000, false),

        Trainset("TS17", true, {JobCard(20, "TS17", "moderate")}, 3200, true),

        Trainset("TS18", true, {JobCard(21, "TS18", "critical")}, 7200, true),

        Trainset("TS19", true, {JobCard(22, "TS19", "minor"), JobCard(23, "TS19", "minor"), JobCard(24, "TS19", "minor")}, 4800, false),

        Trainset("TS20", true, {}, 1200, true),

        Trainset("TS21", true, {JobCard(25, "TS21", "moderate")}, 8000, false),

        Trainset("TS22", false, {JobCard(26, "TS22", "minor")}, 2800, true),

        Trainset("TS23", true, {JobCard(27, "TS23", "critical")}, 5300, true),

        Trainset("TS24", true, {}, 2300, false),

        Trainset("TS25", true, {JobCard(28, "TS25", "moderate")}, 6700, true),

        Trainset("TS26", true, {JobCard(29, "TS26", "minor")}, 1800, false),

        Trainset("TS27", true, {}, 3800, true),

        Trainset("TS28", false, {}, 7500, false),

        Trainset("TS29", true, {JobCard(30, "TS29", "critical")}, 9000, true),

        Trainset("TS30", true, {JobCard(31, "TS30", "moderate"), JobCard(32, "TS30", "moderate")}, 4200, false),

        Trainset("TS31", true, {}, 1400, true)

    };



    // ---------------- Branding for trainsets ----------------

    trainsets[0].addBranding(Branding("CocaCola", 12, 500000));

    trainsets[0].addBranding(Branding("Nike", 6, 300000));



    trainsets[1].addBranding(Branding("Samsung", 18, 700000));

    trainsets[1].addBranding(Branding("LG", 10, 250000));



    trainsets[3].addBranding(Branding("Pepsi", 10, 400000));

    trainsets[3].addBranding(Branding("Adidas", 8, 350000));



    trainsets[4].addBranding(Branding("Sony", 15, 450000));

    trainsets[4].addBranding(Branding("Apple", 12, 600000));

    trainsets[4].addBranding(Branding("BMW", 10, 500000));



    trainsets[5].addBranding(Branding("Microsoft", 12, 750000));



    trainsets[6].addBranding(Branding("Google", 24, 800000));

    trainsets[6].addBranding(Branding("Amazon", 18, 900000));

    trainsets[6].addBranding(Branding("Meta", 12, 600000));



    trainsets[9].addBranding(Branding("Intel", 10, 400000));



    trainsets[10].addBranding(Branding("Tesla", 14, 1100000));



    trainsets[14].addBranding(Branding("Starbucks", 10, 200000));

    trainsets[14].addBranding(Branding("Netflix", 12, 500000));



    trainsets[17].addBranding(Branding("Toyota", 15, 450000));



    trainsets[19].addBranding(Branding("Disney", 20, 950000));

    trainsets[19].addBranding(Branding("HBO", 12, 350000));

    trainsets[19].addBranding(Branding("Samsung", 10, 600000));



    trainsets[20].addBranding(Branding("Ford", 12, 300000));



    trainsets[22].addBranding(Branding("McDonald's", 8, 250000));

    trainsets[22].addBranding(Branding("Nike", 6, 300000));



    trainsets[24].addBranding(Branding("Boeing", 12, 1000000));



    trainsets[26].addBranding(Branding("SpaceX", 18, 1500000));

    trainsets[26].addBranding(Branding("Blue Origin", 12, 800000));



    trainsets[27].addBranding(Branding("Amazon", 12, 900000));

    trainsets[27].addBranding(Branding("Apple", 10, 600000));



    trainsets[30].addBranding(Branding("LG", 12, 250000));



    TrainsetManager manager(trainsets);

    manager.verifyFitness();

    manager.calculateJobCardScore();

    manager.computeMileageBase();

    manager.computeMileageScore();

    manager.computeCleaningScore();

    manager.computeScores();

    manager.printInductionList();



    return 0;

}