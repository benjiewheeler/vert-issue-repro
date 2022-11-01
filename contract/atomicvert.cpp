#include "atomicvert.hpp"

ACTION atomicvert::hi(const name& user)
{
    require_auth(user);

    check(false, "Transfers are closed");
}

[[eosio::on_notify("atomicassets::logtransfer")]] void
atomicvert::handle_logtransfer(name from, name to, vector<uint64_t> asset_ids, string memo)
{
    check(false, "Transfers are closed");
}
