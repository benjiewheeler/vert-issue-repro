#include <eosio/eosio.hpp>

using namespace std;
using namespace eosio;

CONTRACT atomicvert : public contract
{
public:
    using contract::contract;

    // just a dummy action
    ACTION hi(const name& user);

    void handle_logtransfer(name from, name to, vector<uint64_t> asset_ids, string memo);

private:
    // just a dummy table
    TABLE asset_s
    {
        uint64_t asset_id;
        name owner;

        auto primary_key() const { return asset_id; }
    };

    typedef multi_index<name("assets"), asset_s> assets_t;
};