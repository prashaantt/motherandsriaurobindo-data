class SessionsController < ApplicationController
  def create
    user = User.from_omniauth(env['omniauth.auth'])
    session[:user_id] = user.id
    redirect_to root_url, notice: 'Signed in'
  end

  def destroy
    session[:user_id] = nil
    reset_session
    redirect_to root_url, notice: 'Signed out'
  end
end
